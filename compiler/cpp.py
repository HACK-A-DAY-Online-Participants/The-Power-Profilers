import subprocess
import tempfile
import time
import os

def compile_and_run_cpp(code):
    with tempfile.NamedTemporaryFile(delete=False, suffix=".cpp", mode="w") as tmp:
        tmp.write(code)
        source_path = tmp.name

    exe_path = source_path.replace(".cpp", ".exe")

    compile_proc = subprocess.run(
        ["g++", source_path, "-o", exe_path],
        capture_output=True,
        text=True
    )

    if compile_proc.returncode != 0:
        return {
            "error": compile_proc.stderr
        }

    start = time.perf_counter()
    run_proc = subprocess.run([exe_path], capture_output=True, text=True)
    end = time.perf_counter()

    os.remove(source_path)
    os.remove(exe_path)

    exec_time = round(end - start, 5)
    energy = round(exec_time * 0.25, 5)

    return {
        "energy_j": energy,
        "time_s": exec_time,
        "stdout": run_proc.stdout,
        "stderr": run_proc.stderr,
        "return_code": run_proc.returncode
    }
