# compiler/python.py
import tempfile
import os
import json
import subprocess
import sys
from typing import Dict, Any

# Fallback power (watts) for energy estimate when pyRAPL isn't available.
DEFAULT_ESTIMATED_POWER_W = 3.0

def compile_and_run_python(code: str, estimated_power_w: float = DEFAULT_ESTIMATED_POWER_W, timeout_s: int = 30) -> Dict[str, Any]:
    """
    Execute Python code and return:
      - stdout, stderr, return_code
      - total_time_s
      - total_energy_j (measured via pyRAPL if available, else estimated)
      - per-line timing and per-line estimated energy distribution
    """
    with tempfile.TemporaryDirectory() as td:
        src_path = os.path.join(td, "user_code.py")
        wrapper_path = os.path.join(td, "wrapper.py")

        # write the user code to file
        with open(src_path, "w", encoding="utf-8") as f:
            f.write(code)

        # wrapper uses the tracer to measure per-line times and optionally pyRAPL for energy
        wrapper_code = f'''\
import json, sys, os, traceback
from compiler.line_tracer import LineTracer

# optional import for pyRAPL
try:
    import pyRAPL
    pyrapl_available = True
except Exception:
    pyrapl_available = False

target = r"{src_path.replace('\\\\', '\\\\\\\\')}"  # escape backslashes for Windows

tracer = LineTracer()
try:
    if pyrapl_available:
        # measure total energy (works on Linux typically)
        meter = pyRAPL.Measurement('energy-run')
        meter.begin()
        total_time, raw_times = tracer.run_file(target)
        meter.end()
        # pyRAPL returns microjoules depending on config - convert where needed
        try:
            energy_j = sum(meter.result.pkg) if hasattr(meter.result, 'pkg') else getattr(meter.result, 'energy', None)
        except Exception:
            energy_j = None
    else:
        total_time, raw_times = tracer.run_file(target)
        energy_j = None
    result = {{
        "success": True,
        "total_time_s": total_time,
        "energy_j_measured": energy_j,
        "raw_times": raw_times
    }}
    print(json.dumps(result))
except Exception as e:
    tb = traceback.format_exc()
    print(json.dumps({{"success": False, "error": str(e), "traceback": tb}}))
    sys.exit(2)
'''

        with open(wrapper_path, "w", encoding="utf-8") as f:
            f.write(wrapper_code)

        # run wrapper in a fresh Python process so user code executes isolated
        python_exe = sys.executable or "python"
        proc = subprocess.Popen(
            [python_exe, wrapper_path],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        try:
            out, err = proc.communicate(timeout=timeout_s)
        except subprocess.TimeoutExpired:
            proc.kill()
            return {"error": "timeout", "timeout_s": timeout_s}

        # parse JSON printed by wrapper
        try:
            data = json.loads(out.strip().splitlines()[-1]) if out.strip() else {}
        except Exception:
            data = None

        # Build final structured response
        response = {
            "stdout": out,
            "stderr": err,
            "return_code": proc.returncode,
        }

        if not data:
            # wrapper failed to produce structured JSON
            response.update({"error": "failed to parse wrapper output", "raw_output": out})
            return response

        if not data.get("success"):
            # wrapper encountered exception
            response.update({"error": data.get("error"), "traceback": data.get("traceback")})
            return response

        total_time = data.get("total_time_s", 0.0)
        energy_measured = data.get("energy_j_measured", None)
        raw_times = data.get("raw_times", {})

        # convert raw_times keys (tuples) may be strings in JSON from wrapper;
        # ensure we have mapping filename->lineno->time
        # The wrapper uses Python dict with tuple keys; json serialization will make keys strings like "('file', 10)"
        # We'll handle both formats.

        per_line = []
        total_line_time = 0.0
        # raw_times may be a mapping string->value; try to parse
        parsed_raw = {}
        for k, v in raw_times.items():
            if isinstance(k, (list, tuple)) and len(k) == 2:
                filename, lineno = k[0], k[1]
            else:
                # parse string form "('file', 10)"
                try:
                    # unsafe eval avoided; parse manually
                    s = str(k)
                    # find last comma
                    if s.startswith("('") or s.startswith('("'):
                        # remove parentheses
                        s2 = s.strip()
                        if s2[0] == '(' and s2[-1] == ')':
                            s2 = s2[1:-1]
                        # split on comma that separates filename and lineno
                        split_index = s2.rfind(',')
                        filename = s2[:split_index].strip().strip('\'" ')
                        lineno = int(s2[split_index+1:].strip())
                    else:
                        filename = "<unknown>"
                        lineno = 0
                except Exception:
                    filename = "<unknown>"
                    lineno = 0
            parsed_raw.setdefault(filename, []).append((lineno, float(v)))
            total_line_time += float(v)

        # flatten per-line list and compute proportions
        lines_out = []
        for filename, arr in parsed_raw.items():
            for lineno, t in sorted(arr, key=lambda x: (x[0])):
                lines_out.append({"file": filename, "lineno": int(lineno), "time_s": t})

        # if measured energy exists, distribute proportionally by time; else estimate
        if energy_measured is not None:
            total_energy_j = float(energy_measured)
            # avoid division by zero
            if total_line_time <= 0:
                # equal distribution
                per_line_energy = []
                N = len(lines_out) if lines_out else 1
                for L in lines_out:
                    L["energy_j"] = total_energy_j / N
            else:
                for L in lines_out:
                    L["energy_j"] = (L["time_s"] / total_line_time) * total_energy_j
        else:
            # estimate: energy = total_time * estimated_power
            total_energy_j = total_time * {estimated_power_w}
            if total_line_time <= 0:
                # equal distribution
                N = len(lines_out) if lines_out else 1
                for L in lines_out:
                    L["energy_j"] = total_energy_j / N
            else:
                for L in lines_out:
                    L["energy_j"] = (L["time_s"] / total_line_time) * total_energy_j

        response.update({
            "total_time_s": total_time,
            "total_energy_j": total_energy_j,
            "energy_measured": energy_measured is not None,
            "lines": lines_out
        })
        return response
