import os
import sys
import requests
import json

API_URL = "http://127.0.0.1:3000/compile"

def detect_language(file_path):
    ext = os.path.splitext(file_path)[1]

    if ext == ".py":
        return "python"
    elif ext == ".cpp":
        return "cpp"
    elif ext == ".java":
        return "java"
    else:
        return None


def send_to_api(file_path):
    language = detect_language(file_path)
    if language is None:
        print("❌ Unsupported file type:", file_path)
        return

    with open(file_path, "r") as f:
        code = f.read()

    payload = {
        "language": language,
        "code": code
    }

    print("⚡ Sending file to Energy API...")

    try:
        response = requests.post(API_URL, json=payload)

        if response.status_code == 200:
            print("⚡ ENERGY REPORT ------------------")
            print(json.dumps(response.json(), indent=4))
        else:
            print("❌ API error:", response.text)

    except Exception as e:
        print("❌ Error communicating with Energy API:", e)


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("❌ Usage: energy <filename>")
        sys.exit(1)

    file_path = sys.argv[1]
    send_to_api(file_path)
