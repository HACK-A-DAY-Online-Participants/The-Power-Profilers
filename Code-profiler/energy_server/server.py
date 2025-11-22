import sys
import os
from flask import Flask, request, jsonify

# 🔥 PyInstaller-safe base directory
if hasattr(sys, '_MEIPASS'):
    BASE_DIR = sys._MEIPASS
else:
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Compiler folder is sibling inside bundle
COMPILER_DIR = os.path.join(BASE_DIR, "compiler")
sys.path.insert(0, COMPILER_DIR)

# Import compiler logic
from compiler.cpp import compile_and_run_cpp
from compiler.python import compile_and_run_python
from compiler.java import compile_and_run_java

app = Flask(__name__)


@app.get("/")
def home():
    return {"message": "Universal Compiler API is running!"}


@app.post("/compile")
def compile_code():
    try:
        data = request.get_json()
        lang = data.get("language")
        code = data.get("code")

        if lang == "cpp":
            result = compile_and_run_cpp(code)
        elif lang == "python":
            result = run_python(code)
        elif lang == "java":
            result = compile_and_run_java(code)
        else:
            return jsonify({"error": f"Unsupported language: {lang}"}), 400

        return jsonify(result)

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=3000)
