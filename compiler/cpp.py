import tempfile, os
from .exec_utils import run_command_with_energy

def compile_and_run_cpp(code: str):
    with tempfile.TemporaryDirectory() as td:
        src = os.path.join(td, "main.cpp")
        exe = os.path.join(td, "a.exe")

        with open(src, "w") as f:
            f.write(code)

        compile_cmd = ["g++", src, "-O2", "-o", exe]
        compile_result = run_command_with_energy(compile_cmd)

        if compile_result["return_code"] != 0:
            return {"compile_error": True, **compile_result}

        run_result = run_command_with_energy([exe])

        return {
            "compile": compile_result,
            "run": run_result
        }
