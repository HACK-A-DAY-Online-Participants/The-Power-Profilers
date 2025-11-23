import tempfile
import os
import subprocess
from exec_utils import run_with_energy

def run_cpp(code):
    with tempfile.NamedTemporaryFile(delete=False, suffix=".cpp", mode="w") as tmp:
        tmp.write(code)
        cpp_path = tmp.name

    exe_path = cpp_path + ".exe"

    compile_result = subprocess.run(
        ["g++", cpp_path, "-o", exe_path],
        capture_output=True,
        text=True
    )

    if compile_result.returncode != 0:
        return {"error": compile_result.stderr}

    result = run_with_energy([exe_path])

    os.remove(cpp_path)
    os.remove(exe_path)

    return result
