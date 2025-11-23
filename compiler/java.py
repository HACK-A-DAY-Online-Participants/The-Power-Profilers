import tempfile
import subprocess
import os
from exec_utils import run_with_energy

def run_java(code):
    with tempfile.NamedTemporaryFile(delete=False, suffix=".java", mode="w") as tmp:
        tmp.write(code)
        java_path = tmp.name

    class_name = "Main"
    os.rename(java_path, java_path.replace("tmp", class_name))
    java_path = java_path.replace("tmp", class_name)

    compile_result = subprocess.run(
        ["javac", java_path],
        capture_output=True,
        text=True
    )

    if compile_result.returncode != 0:
        return {"error": compile_result.stderr}

    result = run_with_energy(["java", class_name])

    os.remove(java_path)
    try:
        os.remove(class_name + ".class")
    except:
        pass

    return result
