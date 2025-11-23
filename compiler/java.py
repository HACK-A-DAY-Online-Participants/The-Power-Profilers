import subprocess
import tempfile
import time
import os

def compile_and_run_java(code):
    with tempfile.NamedTemporaryFile(delete=False, suffix=".java", mode="w") as tmp:
        tmp.write(code)
        src_path = tmp.name

    classname = os.path.basename(src_path).replace(".java", "")

    compile_proc = subprocess.run(
        ["javac", src_path],
        capture_output=True, text=True
    )

    if compile_proc.returncode != 0:
        return {
            "error": compile_proc.stderr
        }

    start = time.perf_counter()
    run_proc = subprocess.run(
        ["java", classname],
        capture_output=True, text=True
    )
    end = time.perf_counter()

    exec_time = round(end - start, 5)
    energy = round(exec_time * 0.20, 5)

    class_file = classname + ".class"
    if os.path.exists(class_file):
        os.remove(class_file)
    os.remove(src_path)

    return {
        "energy_j": energy,
        "time_s": exec_time,
        "stdout": run_proc.stdout,
        "stderr": run_proc.stderr,
        "return_code": run_proc.returncode
    }
