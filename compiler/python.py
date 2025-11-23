import subprocess
import tempfile
import time
import sys
import os

def run_python_with_trace(code):
    """Run Python code and return energy + time + output."""

    with tempfile.NamedTemporaryFile(delete=False, suffix=".py", mode="w") as tmp:
        tmp.write(code)
        tmp_path = tmp.name

    start = time.perf_counter()

    try:
        proc = subprocess.run(
            [sys.executable, tmp_path],
            capture_output=True,
            text=True,
            timeout=10
        )
    except Exception as e:
        return {
            "error": str(e)
        }

    end = time.perf_counter()
    os.remove(tmp_path)

    exec_time = round(end - start, 5)  # seconds
    energy = round(exec_time * 0.13, 5)  # fake joule estimate

    return {
        "energy_j": energy,
        "time_s": exec_time,
        "stdout": proc.stdout,
        "stderr": proc.stderr,
        "return_code": proc.returncode
    }
