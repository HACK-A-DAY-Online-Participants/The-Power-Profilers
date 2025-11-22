import time
import subprocess
import statistics

def measure_energy(cmd):
    """
    Runs ANY command and returns:
      - stdout
      - stderr
      - return_code
      - duration_s
    """
    start = time.perf_counter()

    proc = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    out, err = proc.communicate()

    duration = time.perf_counter() - start

    return {
        "stdout": out,
        "stderr": err,
        "return_code": proc.returncode,
        "duration_s": duration,
        "energy_j": duration  # simple proxy, 1 sec ≈ 1 joule placeholder
    }


# backwards compatible main
def run_snippet(path: str, runs=5):
    durations = []
    for _ in range(runs):
        start = time.perf_counter()
        subprocess.run(["python", path], check=True)
        durations.append(time.perf_counter() - start)
    return statistics.mean(durations), statistics.pstdev(durations)


if __name__ == "__main__":
    import sys
    if len(sys.argv) < 2:
        print("Usage: python measure_energy.py script.py")
        sys.exit(1)
    mean, std = run_snippet(sys.argv[1])
    print(f"Average runtime: {mean:.4f}s ± {std:.4f}s (proxy for energy)")
