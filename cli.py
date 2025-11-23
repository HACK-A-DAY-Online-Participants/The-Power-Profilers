import os
import sys
import time
import requests
import subprocess

API_URL = "http://127.0.0.1:3000/compile"


# -------------------------------------------------------
# Check if Energy API is running
# -------------------------------------------------------
def is_api_running():
    try:
        r = requests.get("http://127.0.0.1:3000/")
        return r.status_code == 200
    except:
        return False


# -------------------------------------------------------
# Start API automatically if not running
# -------------------------------------------------------
def start_api():
    print("⚠ Energy API not running — starting it now...")

    try:
        subprocess.Popen(
            ["python", "C:\\EnergyAPI\\server.py"],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL
        )
    except Exception as e:
        print("❌ Failed to start Energy API:", e)
        return False

    # Wait for startup
    for _ in range(10):
        if is_api_running():
            print("✓ Energy API started.")
            return True
        time.sleep(0.4)

    print("❌ Energy API failed to start.")
    return False


# -------------------------------------------------------
# Send file to API
# -------------------------------------------------------
def send_to_api(file_path):
    if not os.path.exists(file_path):
        print(f"❌ File not found: {file_path}")
        return

    # Detect language from extension
    ext = os.path.splitext(file_path)[1]
    lang = {
        ".py": "python",
        ".cpp": "cpp",
        ".cc": "cpp",
        ".cxx": "cpp",
        ".java": "java"
    }.get(ext, None)

    if lang is None:
        print("❌ Unsupported file type:", ext)
        return

    with open(file_path, "r") as f:
        code = f.read()

    print("⚡ Sending file to Energy API...")

    try:
        res = requests.post(API_URL, json={
            "language": lang,
            "code": code
        })

        result = res.json()

        if "error" in result:
            print("❌ API returned error:", result["error"])
            return

        # -----------------------------
        # Pretty printing final output
        # -----------------------------
        print("\n⚡ ENERGY REPORT -------------------------")
        print(f"Energy: {result['energy_j']:.5f} Joules")
        print(f"Time:   {result['time_s']:.5f} seconds")
        print(f"Stdout: {result['stdout'].strip()}")

    except Exception as e:
        print("❌ Error communicating with API:", e)


# -------------------------------------------------------
# MAIN
# -------------------------------------------------------
if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: energy <file.py/cpp/java>")
        sys.exit(1)

    file_path = sys.argv[1]

    # Ensure API is running
    if not is_api_running():
        if not start_api():
            sys.exit(1)

    send_to_api(file_path)
