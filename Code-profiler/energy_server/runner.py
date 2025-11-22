# api/runner.py
# Lightweight runner to compile code inside Docker (recommended) or locally, and to collect energy/time metrics.
import os
import shlex
import subprocess
import time
import json
from typing import List, Optional

# Path to the provided measure script (you already have scripts/measure_energy.py)
MEASURE_SCRIPT = os.path.join(os.path.dirname(__file__), "..", "scripts", "measure_energy.py")
MEASURE_SCRIPT = os.path.abspath(MEASURE_SCRIPT)

def _readable_cmd(cmd: List[str]) -> str:
    return " ".join(shlex.quote(p) for p in cmd)

def run_local(cmd: List[str], timeout: int = 300):
    """Run a local command (not recommended for untrusted code)."""
    start = time.time()
    proc = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    try:
        out, err = proc.communicate(timeout=timeout)
        rc = proc.returncode
    except subprocess.TimeoutExpired:
        proc.kill()
        out, err = proc.communicate()
        rc = -1
        err = (err or "") + "\nTIMEOUT"
    end = time.time()
    return {
        "cmd": _readable_cmd(cmd),
        "return_code": rc,
        "stdout": out,
        "stderr": err,
        "duration_s": end - start
    }

def run_docker(compile_cmd: List[str], workdir_host: str, image: str = "ubuntu:24.04", mount_sys: bool = True, timeout: int = 300):
    """
    Run compilation inside a docker container and measure energy using the measure script mounted into container.
    - compile_cmd: list of command tokens, e.g. ["gcc","-O2","main.c","-o","main"]
    - workdir_host: path on host to mount at /workspace
    - image: docker image that includes required compiler(s) OR you can prepare a custom image.
    """
    # Ensure workdir exists
    workdir_host = os.path.abspath(workdir_host)
    if not os.path.exists(workdir_host):
        raise FileNotFoundError(workdir_host)

    # We'll mount /workspace and also mount the repo's scripts folder so container can run measure script.
    scripts_dir_host = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "scripts"))
    container_cmd = [
        "docker", "run", "--rm",
        "-v", f"{workdir_host}:/workspace:rw",
        "-v", f"{scripts_dir_host}:/opt/scripts:ro",
        "--workdir", "/workspace",
        "--network", "none",  # isolate network
        "--cpus", "1.0",      # limit CPU for safety (adjust)
        "--memory", "1g",     # limit memory
    ]
    if mount_sys:
        container_cmd += ["-v", "/sys:/sys:ro"]

    # The measure script expects to be called inside the container at /opt/scripts/measure_energy.py
    # We'll craft a wrapper bash command which: runs the measure script before/after compile and prints JSON.
    compile_cmd_str = _readable_cmd(compile_cmd)
    wrapper = (
        "python3 /opt/scripts/measure_energy.py --run -- " + compile_cmd_str +
        " || true"
    )
    # Use a base image that has python and compilers installed; user should prepare an image "code-compile" or pass full image
    container_cmd += [image, "bash", "-lc", wrapper]

    # Run docker
    start = time.time()
    proc = subprocess.Popen(container_cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    try:
        out, err = proc.communicate(timeout=timeout)
        rc = proc.returncode
    except subprocess.TimeoutExpired:
        proc.kill()
        out, err = proc.communicate()
        rc = -1
        err = (err or "") + "\nTIMEOUT"
    end = time.time()

    # Try to parse JSON output produced by measure_energy.py; fall back to raw output.
    parsed = None
    try:
        parsed = json.loads(out.strip().splitlines()[-1])
    except Exception:
        # If the measure script prints lots of logs, attempt to find a JSON block
        for line in out.splitlines()[::-1]:
            line = line.strip()
            if line.startswith("{") and line.endswith("}"):
                try:
                    parsed = json.loads(line)
                    break
                except Exception:
                    continue

    result = {
        "docker_command": " ".join(container_cmd),
        "raw_stdout": out,
        "raw_stderr": err,
        "duration_s": end - start,
        "return_code": rc,
        "parsed": parsed
    }
    return result
