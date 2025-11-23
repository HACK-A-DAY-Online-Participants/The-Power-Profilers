import subprocess
import tempfile
import time
import sys
import os

def run_with_energy(cmd, input_code=None):
    with tempfile.NamedTemporaryFile(delete=False, mode="w", suffix=".txt") as tmp:
        if input_code:
            tmp.write(input_code)
        tmp_path = tmp.name

    start = time.perf_counter()

    try:
        result = subprocess.run(
            cmd,
            input=input_code,
            text=True,
            capture_output=True,
            timeout=10
        )
    except Exception as e:
        return {"error": str(e)}

    end = time.perf_counter()
    duration = end - start

    # Fake energy model (simple constant multiplier)
    energy = duration * 0.13  

    os.remove(tmp_path)

    return {
        "energy": energy,
        "time": duration,
        "stdout": result.stdout.strip(),
        "stderr": result.stderr.strip(),
        "return_code": result.returncode
    }
