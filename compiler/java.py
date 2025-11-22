import tempfile, os
from .exec_utils import run_command_with_energy

def compile_and_run_java(code: str):
    with tempfile.TemporaryDirectory() as td:
        src = os.path.join(td, "Main.java")

        with open(src, "w") as f:
            f.write(code)

        compile_result = run_command_with_energy(["javac", src])

        if compile_result["return_code"] != 0:
            return {"compile_error": True, **compile_result}

        run_result = run_command_with_energy(["java", "-cp", td, "Main"])

        return {
            "compile": compile_result,
            "run": run_result
        }
