import subprocess
import time
import psutil

def run_command_with_energy(cmd):
    start = time.time()
    process = psutil.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)

    p = psutil.Process(process.pid)

    energy_used = 0
    try:
        while process.poll() is None:
            time.sleep(0.05)
            try:
                energy_used += p.cpu_percent() * 0.0001
            except:
                pass
    except:
        pass

    stdout, stderr = process.communicate()

    return {
        "return_code": process.returncode,
        "stdout": stdout,
        "stderr": stderr,
        "time": round(time.time() - start, 3),
        "energy": round(energy_used, 4)
    }
