import os
import sys
from flask import Flask, request, jsonify

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
COMPILER_DIR = os.path.join(BASE_DIR, "compiler")
sys.path.insert(0, COMPILER_DIR)

from compiler.cpp import compile_and_run_cpp
from compiler.python import compile_and_run_python
from compiler.java import compile_and_run_java

app = Flask(__name__)

@app.get("/")
def home():
    return {"message": "Energy API is running"}

@app.post("/compile")
def compile_code():
    data = request.get_json()
    lang = data.get("language")
    code = data.get("code")

    if not code:
        return jsonify({"error": "missing code"}), 400

    try:
        if lang == "cpp":
            return jsonify(compile_and_run_cpp(code))
        elif lang == "python":
            return jsonify(compile_and_run_python(code))
        elif lang == "java":
            return jsonify(compile_and_run_java(code))
        else:
            return jsonify({"error": "Unsupported language"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    print("🔥 Energy API starting... port 3000")
    app.run(host="0.0.0.0", port=3000)
