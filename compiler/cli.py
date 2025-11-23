import os
import sys
import json
import requests
import subprocess
import tempfile
import argparse
import pyperclip  # NEW: for clipboard support

API_URL = "http://127.0.0.1:3000/compile"

def detect_language(file_name):
    ext = os.path.splitext(file_name)[1].lower()
    return {
        ".py": "python",
        ".cpp": "cpp",
        ".c": "cpp",
        ".java": "java"
    }.get(ext, None)

def send_to_api(code, lang):
    try:
        res = requests.post(API_URL, json={"code": code, "language": lang}, timeout=5)
        return res.json()
    except Exception as e:
        return {"error": f"API communication failed: {str(e)}"}

def ensure_api_running():
    try:
        requests.get("http://127.0.0.1:3000/", timeout=1)
        print("✓ Energy API already running.")
        return
    except:
        print("⚠ Energy API not running — starting it now...")

    subprocess.Popen(["python", "C:\\EnergyAPI\\server.py"], creationflags=subprocess.CREATE_NO_WINDOW)
    
    import time
    for _ in range(10):
        try:
            requests.get("http://127.0.0.1:3000/", timeout=1)
            print("✓ Energy API started.")
            return
        except:
            time.sleep(0.5)
    
    print("❌ Failed to start Energy API.")
    sys.exit(1)

def run_saved_file(path):
    lang = detect_language(path)
    if not lang:
        print("❌ Unsupported file type")
        return

    with open(path, "r") as f:
        code = f.read()

    return send_to_api(code, lang)


def run_unsaved_editor():
    """Reads VS Code temp file passed internally."""
    print("⚡ Reading unsaved VS Code content...")

    content = sys.stdin.read()  # VS Code pipes content
    if not content.strip():
        print("❌ No content provided from editor.")
        return

    temp = tempfile.NamedTemporaryFile(delete=False, suffix=".py")
    temp.write(content.encode())
    temp.close()

    return run_saved_file(temp.name)


def run_clipboard():
    print("⚡ Running energy on clipboard code...")
    code = pyperclip.paste()

    if not code.strip():
        print("❌ Clipboard is empty.")
        return

    # default python
    return send_to_api(code, "python")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("file", nargs="?", help="File to analyze")
    parser.add_argument("--clipboard", action="store_true", help="Run energy on clipboard")
    parser.add_argument("--stdin", action="store_true", help="Run on unsaved VS Code editor input")

    args = parser.parse_args()

    ensure_api_running()

    if args.clipboard:
        result = run_clipboard()
    elif args.stdin:
        result = run_unsaved_editor()
    elif args.file:
        result = run_saved_file(args.file)
    else:
        print("❌ No input provided.")
        print("Usage:")
        print("  energy file.py")
        print("  energy --clipboard")
        print("  energy --stdin  (VS Code)")
        return

    print("\n⚡ ENERGY REPORT -------------------------")
    print(json.dumps(result, indent=4))


if __name__ == "__main__":
    main()
