from .exec_utils import run_command_with_energy
import tempfile, os

def run_python(code):
    with tempfile.NamedTemporaryFile(suffix=".py", delete=False) as tmp:
        tmp.write(code.encode())
        tmp.flush()
        return run_command_with_energy(["python3", tmp.name])
