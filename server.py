import os
import sys
from flask import Flask, request, jsonify

# Base directory
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
COMPILER_DIR = os.path.join(BASE_DIR, "compiler")
sys.path.insert(0, COMPILER_DIR)

# Correct imports from compiler folder
from python import run_python
from cpp import compile_and_run_cpp
from java import compile_and_run_java

app = Flask(__name__)


@app.get("/")
def home():
    return {"message": "Energy API running"}


@app.post("/compile")
def compile_code():
    data = request.get_json()

    lang = data.get("language")
    code = data.get("code")

    if not code:
        return jsonify({"error": "missing code"}), 400

    try:
        # -----------------------------
        # PYTHON
        # -----------------------------
        if lang == "python":
            result = run_python(code)

        # -----------------------------
        # C++
        # -----------------------------
        elif lang == "cpp":
            result = compile_and_run_cpp(code)

        # -----------------------------
        # JAVA
        # -----------------------------
        elif lang == "java":
            result = compile_and_run_java(code)

        else:
            return jsonify({"error": "Unsupported language"}), 400

        # ---- Format energy & time ----
        result["energy_j"] = float(f"{result['energy_j']:.5f}")
        result["time_s"]   = float(f"{result['time_s']:.5f}")

        return jsonify(result)

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    print("🔥 Energy API starting on port 3000...")
    app.run(host="0.0.0.0", port=3000)
