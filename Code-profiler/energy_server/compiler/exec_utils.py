import subprocess, time, tempfile, os, json
from scripts.measure_energy import measure_energy   # your existing script

def run_command_with_energy(cmd, timeout=5):
    start = time.time()
    out = measure_energy(cmd)   # returns {energy_j, stdout, stderr}
    end = time.time()

    out["time_taken_s"] = end - start
    return out
