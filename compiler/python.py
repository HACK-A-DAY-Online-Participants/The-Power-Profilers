import subprocess
import tempfile
import time
import sys
import os

def run_python(code):
    """Run full Python code and measure time + simulated energy."""

    # Save code to a temporary file
    with tempfile.NamedTemporaryFile(delete=False, suffix=".py", mode="w") as tmp:
        tmp.write(code)
        tmp_path = tmp.name

    start = time.perf_counter()

    proc = subprocess.run(
        [sys.executable, tmp_path],
        capture_output=True,
        text=True
    )

    end = time.perf_counter()
    os.remove(tmp_path)

    elapsed = end - start
    energy = elapsed * 0.13  # Simple energy model

    return {
        "energy_j": energy,
        "time_s": elapsed,
        "stdout": proc.stdout,
        "stderr": proc.stderr,
        "return_code": proc.returncode
    }
