import tempfile, os
from .exec_utils import run_command_with_energy

def compile_and_run_python(code: str):
    with tempfile.TemporaryDirectory() as td:
        src = os.path.join(td, "main.py")

        with open(src, "w") as f:
            f.write(code)

        return run_command_with_energy(["python", src])
