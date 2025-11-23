import os
import sys
from flask import Flask, request, jsonify

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
COMPILER_DIR = os.path.join(BASE_DIR, "compiler")
sys.path.insert(0, COMPILER_DIR)

from python import run_python_with_trace
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
        if lang == "python":
            return jsonify(run_python_with_trace(code))
        elif lang == "cpp":
            return jsonify(compile_and_run_cpp(code))
        elif lang == "java":
            return jsonify(compile_and_run_java(code))
        else:
            return jsonify({"error": "Unsupported language"}), 400

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    print("🔥 Energy API running on port 3000")
    app.run(host="0.0.0.0", port=3000)
