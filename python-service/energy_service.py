# python-service/energy_service.py
"""
Multi-language energy measurement service with AI-powered optimization
- Energy measurement for Python/JS/C++/Java
- AI code optimization via Hugging Face models
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from codecarbon import EmissionsTracker
import tempfile
import subprocess
import sys
import os
import time
import traceback
import psutil
import platform

# Hugging Face imports
try:
    from transformers import AutoTokenizer, AutoModelForCausalLM, pipeline
    import torch
    HF_AVAILABLE = True
except ImportError:
    HF_AVAILABLE = False
    print("⚠️  Hugging Face transformers not installed. AI optimization disabled.")

app = Flask(__name__)
CORS(app)

# Global model cache
model_cache = {}

def load_optimization_model():
    """Load Hugging Face model for code optimization"""
    if not HF_AVAILABLE:
        return None
    
    model_name = "Salesforce/codegen-350M-mono"  # Smaller, faster model
    # Alternative models:
    # - "Salesforce/codet5-base" (good for code understanding)
    # - "bigcode/starcoder" (larger, better quality)
    # - "codellama/CodeLlama-7b-hf" (requires more RAM)
    
    if 'optimizer' in model_cache:
        return model_cache['optimizer']
    
    try:
        print(f"🤖 Loading AI model: {model_name}")
        tokenizer = AutoTokenizer.from_pretrained(model_name)
        model = AutoModelForCausalLM.from_pretrained(
            model_name,
            torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32,
            device_map="auto" if torch.cuda.is_available() else None
        )
        
        model_cache['optimizer'] = {
            'tokenizer': tokenizer,
            'model': model,
            'name': model_name
        }
        print(f"✅ Model loaded successfully")
        return model_cache['optimizer']
    except Exception as e:
        print(f"❌ Error loading model: {e}")
        return None

def generate_optimization_suggestions(code, language, energy_hotspots):
    """Generate AI-powered optimization suggestions"""
    if not HF_AVAILABLE:
        return {
            "error": "AI optimization not available",
            "reason": "Hugging Face transformers not installed",
            "install": "pip install transformers torch"
        }
    
    model_data = load_optimization_model()
    if not model_data:
        return {"error": "Model loading failed"}
    
    tokenizer = model_data['tokenizer']
    model = model_data['model']
    
    try:
        # Create optimization prompt
        hotspot_info = ""
        if energy_hotspots:
            hotspot_info = f"Energy hotspots found at lines: {', '.join(str(h['startLine']) for h in energy_hotspots[:3])}"
        
        prompt = f"""# {language.upper()} Code Optimization Task
# Original code with energy inefficiencies:
{code}

# Energy Analysis: {hotspot_info}
# Optimized version with explanations:
"""

        # Generate optimization
        inputs = tokenizer(prompt, return_tensors="pt", max_length=512, truncation=True)
        
        if torch.cuda.is_available():
            inputs = {k: v.cuda() for k, v in inputs.items()}
        
        with torch.no_grad():
            outputs = model.generate(
                **inputs,
                max_new_tokens=300,
                temperature=0.7,
                top_p=0.95,
                do_sample=True,
                pad_token_id=tokenizer.eos_token_id
            )
        
        generated = tokenizer.decode(outputs[0], skip_special_tokens=True)
        
        # Extract the generated part (after prompt)
        optimized_code = generated[len(prompt):].strip()
        
        # Parse suggestions (simple heuristic)
        suggestions = []
        if "for" in code and "for" not in optimized_code:
            suggestions.append("Replace nested loops with hash-based lookup")
        if ".map" in code and ".reduce" in optimized_code:
            suggestions.append("Use reduce for single-pass iteration")
        if "StringBuilder" in optimized_code and "+" in code:
            suggestions.append("Use StringBuilder for string concatenation")
        
        # If no specific suggestions, provide generic ones
        if not suggestions:
            suggestions = [
                "Consider algorithm complexity optimization",
                "Review memory allocation patterns",
                "Check for unnecessary iterations"
            ]
        
        return {
            "status": "success",
            "model": model_data['name'],
            "optimized_code": optimized_code[:500],  # Limit length
            "suggestions": suggestions,
            "confidence": 0.75  # Placeholder
        }
        
    except Exception as e:
        return {
            "status": "error",
            "error": f"AI optimization failed: {str(e)}"
        }

def get_simple_optimization_suggestions(language, code, hotspots):
    """Rule-based optimization suggestions (fallback)"""
    suggestions = []
    
    # Language-specific suggestions
    if language == "javascript":
        if ".forEach" in code and ".forEach" in code[code.index(".forEach")+1:]:
            suggestions.append({
                "type": "algorithm",
                "title": "Replace nested forEach with reduce",
                "description": "Nested forEach creates multiple iterations. Use reduce for single-pass processing.",
                "example": "const result = arr.reduce((acc, item) => { /* logic */ }, {});"
            })
        if ".filter" in code and ".map" in code:
            suggestions.append({
                "type": "algorithm",
                "title": "Combine filter and map",
                "description": "Use reduce to filter and transform in one pass instead of two.",
                "example": "arr.reduce((acc, x) => condition ? [...acc, transform(x)] : acc, []);"
            })
    
    elif language == "python":
        if "for" in code and "range(len(" in code:
            suggestions.append({
                "type": "algorithm",
                "title": "Use enumerate instead of range(len())",
                "description": "More Pythonic and slightly more efficient.",
                "example": "for i, item in enumerate(arr):"
            })
        if "+=" in code and "for" in code:
            suggestions.append({
                "type": "memory",
                "title": "Use list comprehension",
                "description": "List comprehensions are faster than append in loops.",
                "example": "result = [x*2 for x in arr if x > 0]"
            })
    
    elif language == "java":
        if "+" in code and "String" in code:
            suggestions.append({
                "type": "memory",
                "title": "Use StringBuilder",
                "description": "String concatenation with + creates many objects.",
                "example": "StringBuilder sb = new StringBuilder(); sb.append(str);"
            })
        if "ArrayList" in code and ".add(" in code:
            suggestions.append({
                "type": "memory",
                "title": "Pre-allocate ArrayList capacity",
                "description": "Avoid dynamic resizing by setting initial capacity.",
                "example": "List<T> list = new ArrayList<>(expectedSize);"
            })
    
    elif language == "cpp":
        if "push_back" in code:
            suggestions.append({
                "type": "memory",
                "title": "Reserve vector capacity",
                "description": "Pre-allocate memory to avoid reallocation.",
                "example": "vec.reserve(expectedSize);"
            })
        if "new" in code:
            suggestions.append({
                "type": "memory",
                "title": "Use smart pointers",
                "description": "Prevent memory leaks with RAII.",
                "example": "std::unique_ptr<T> ptr = std::make_unique<T>();"
            })
    
    # Add hotspot-based suggestions
    for hotspot in hotspots[:3]:
        if hotspot.get('type') == 'loop':
            suggestions.append({
                "type": "algorithm",
                "title": f"Optimize loop at line {hotspot.get('startLine')}",
                "description": hotspot.get('suggestion', 'Consider reducing time complexity'),
                "severity": hotspot.get('score', 0.5)
            })
    
    return suggestions

# [Keep all the existing measurement functions: estimate_energy_from_metrics, 
#  measure_javascript_energy, measure_cpp_energy, measure_java_energy, 
#  measure_python_energy - UNCHANGED]

def estimate_energy_from_metrics(cpu_percent, memory_mb, duration_sec):
    """Estimate energy consumption from CPU/memory metrics"""
    cpu_power_watts = (cpu_percent / 100.0) * 65.0
    cpu_energy_joules = cpu_power_watts * duration_sec
    ram_power_watts = (memory_mb / 8192.0) * 3.0
    ram_energy_joules = ram_power_watts * duration_sec
    total_joules = cpu_energy_joules + ram_energy_joules
    total_kwh = total_joules / 3600000.0
    total_wh = total_kwh * 1000
    total_mj = total_joules
    co2_kg = total_kwh * 0.475
    
    return {
        "total_kwh": round(total_kwh, 8),
        "total_wh": round(total_wh, 6),
        "total_mj": round(total_mj, 2),
        "co2_emissions_kg": round(co2_kg, 8),
        "co2_emissions_g": round(co2_kg * 1000, 6)
    }

def measure_javascript_energy(code, stdin_input=""):
    """Measure JavaScript energy using Node.js and process monitoring"""
    with tempfile.NamedTemporaryFile(mode='w', suffix='.js', delete=False) as f:
        f.write(code)
        temp_file = f.name
    
    try:
        start_time = time.time()
        process = subprocess.Popen(
            ['node', temp_file],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        
        ps_process = psutil.Process(process.pid)
        cpu_samples = []
        memory_samples = []
        
        try:
            stdout, stderr = process.communicate(input=stdin_input, timeout=10)
            try:
                cpu_percent = ps_process.cpu_percent(interval=0.1)
                memory_mb = ps_process.memory_info().rss / 1024 / 1024
                cpu_samples.append(cpu_percent)
                memory_samples.append(memory_mb)
            except psutil.NoSuchProcess:
                cpu_percent = 5.0
                memory_mb = 50.0
        except subprocess.TimeoutExpired:
            process.kill()
            return None, "Execution timeout (10s limit)"
        
        execution_time = time.time() - start_time
        avg_cpu = sum(cpu_samples) / len(cpu_samples) if cpu_samples else 5.0
        avg_memory = sum(memory_samples) / len(memory_samples) if memory_samples else 50.0
        energy = estimate_energy_from_metrics(avg_cpu, avg_memory, execution_time)
        
        return {
            "status": "success" if process.returncode == 0 else "error",
            "output": stdout,
            "error": stderr if process.returncode != 0 else None,
            "executionTime": round(execution_time * 1000, 2),
            "energy": energy,
            "hardware": {
                "cpu_energy": "estimated from process metrics",
                "gpu_energy": "not tracked",
                "ram_energy": "estimated"
            },
            "measurement_method": "system-metrics"
        }, None
    finally:
        if os.path.exists(temp_file):
            os.unlink(temp_file)

def measure_cpp_energy(code, stdin_input=""):
    """Measure C++ energy using g++ and process monitoring"""
    # Create temp source file
    with tempfile.NamedTemporaryFile(mode='w', suffix='.cpp', delete=False) as f:
        f.write(code)
        source_file = f.name
    
    # Create temp executable
    executable = tempfile.mktemp(suffix='.exe' if platform.system() == 'Windows' else '')
    
    try:
        # Compile
        compile_result = subprocess.run(
            ['g++', source_file, '-o', executable, '-std=c++17'],
            capture_output=True,
            text=True,
            timeout=10
        )
        
        if compile_result.returncode != 0:
            return {
                "status": "error",
                "error": f"Compilation error: {compile_result.stderr}",
                "output": "",
                "executionTime": 0
            }, None
        
        # Execute and monitor
        start_time = time.time()
        process = subprocess.Popen(
            [executable],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        
        ps_process = psutil.Process(process.pid)
        cpu_samples = []
        memory_samples = []
        
        try:
            stdout, stderr = process.communicate(input=stdin_input, timeout=10)
            
            try:
                cpu_percent = ps_process.cpu_percent(interval=0.1)
                memory_mb = ps_process.memory_info().rss / 1024 / 1024
                cpu_samples.append(cpu_percent)
                memory_samples.append(memory_mb)
            except psutil.NoSuchProcess:
                cpu_percent = 8.0
                memory_mb = 10.0
        
        except subprocess.TimeoutExpired:
            process.kill()
            return None, "Execution timeout (10s limit)"
        
        execution_time = time.time() - start_time
        
        avg_cpu = sum(cpu_samples) / len(cpu_samples) if cpu_samples else 8.0
        avg_memory = sum(memory_samples) / len(memory_samples) if memory_samples else 10.0
        
        energy = estimate_energy_from_metrics(avg_cpu, avg_memory, execution_time)
        
        return {
            "status": "success" if process.returncode == 0 else "error",
            "output": stdout,
            "error": stderr if process.returncode != 0 else None,
            "executionTime": round(execution_time * 1000, 2),
            "energy": energy,
            "hardware": {
                "cpu_energy": "estimated from process metrics",
                "gpu_energy": "not tracked",
                "ram_energy": "estimated"
            },
            "measurement_method": "system-metrics"
        }, None
        
    finally:
        if os.path.exists(source_file):
            os.unlink(source_file)
        if os.path.exists(executable):
            os.unlink(executable)

def measure_java_energy(code, stdin_input=""):
    """Measure Java energy using javac/java and process monitoring"""
    # Create temp source file
    with tempfile.TemporaryDirectory() as tmpdir:
        source_file = os.path.join(tmpdir, 'Main.java')
        with open(source_file, 'w') as f:
            f.write(code)
        
        try:
            # Compile
            compile_result = subprocess.run(
                ['javac', source_file],
                capture_output=True,
                text=True,
                timeout=10,
                cwd=tmpdir
            )
            
            if compile_result.returncode != 0:
                return {
                    "status": "error",
                    "error": f"Compilation error: {compile_result.stderr}",
                    "output": "",
                    "executionTime": 0
                }, None
            
            # Execute and monitor
            start_time = time.time()
            process = subprocess.Popen(
                ['java', 'Main'],
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                cwd=tmpdir
            )
            
            ps_process = psutil.Process(process.pid)
            cpu_samples = []
            memory_samples = []
            
            try:
                stdout, stderr = process.communicate(input=stdin_input, timeout=10)
                
                try:
                    cpu_percent = ps_process.cpu_percent(interval=0.1)
                    memory_mb = ps_process.memory_info().rss / 1024 / 1024
                    cpu_samples.append(cpu_percent)
                    memory_samples.append(memory_mb)
                except psutil.NoSuchProcess:
                    cpu_percent = 10.0
                    memory_mb = 80.0  # Java has higher memory overhead
            
            except subprocess.TimeoutExpired:
                process.kill()
                return None, "Execution timeout (10s limit)"
            
            execution_time = time.time() - start_time
            
            avg_cpu = sum(cpu_samples) / len(cpu_samples) if cpu_samples else 10.0
            avg_memory = sum(memory_samples) / len(memory_samples) if memory_samples else 80.0
            
            energy = estimate_energy_from_metrics(avg_cpu, avg_memory, execution_time)
            
            return {
                "status": "success" if process.returncode == 0 else "error",
                "output": stdout,
                "error": stderr if process.returncode != 0 else None,
                "executionTime": round(execution_time * 1000, 2),
                "energy": energy,
                "hardware": {
                    "cpu_energy": "estimated from process metrics",
                    "gpu_energy": "not tracked",
                    "ram_energy": "estimated (includes JVM overhead)"
                },
                "measurement_method": "system-metrics"
            }, None
            
        except Exception as e:
            return None, f"Java execution error: {str(e)}"
        
def measure_cpp_energy(code, stdin_input=""):
    """Measure C++ energy using g++ and process monitoring"""
    # Create temp source file
    with tempfile.NamedTemporaryFile(mode='w', suffix='.cpp', delete=False) as f:
        f.write(code)
        source_file = f.name
    
    # Create temp executable
    executable = tempfile.mktemp(suffix='.exe' if platform.system() == 'Windows' else '')
    
    try:
        # Compile
        compile_result = subprocess.run(
            ['g++', source_file, '-o', executable, '-std=c++17'],
            capture_output=True,
            text=True,
            timeout=10
        )
        
        if compile_result.returncode != 0:
            return {
                "status": "error",
                "error": f"Compilation error: {compile_result.stderr}",
                "output": "",
                "executionTime": 0
            }, None
        
        # Execute and monitor
        start_time = time.time()
        process = subprocess.Popen(
            [executable],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        
        ps_process = psutil.Process(process.pid)
        cpu_samples = []
        memory_samples = []
        
        try:
            stdout, stderr = process.communicate(input=stdin_input, timeout=10)
            
            try:
                cpu_percent = ps_process.cpu_percent(interval=0.1)
                memory_mb = ps_process.memory_info().rss / 1024 / 1024
                cpu_samples.append(cpu_percent)
                memory_samples.append(memory_mb)
            except psutil.NoSuchProcess:
                cpu_percent = 8.0
                memory_mb = 10.0
        
        except subprocess.TimeoutExpired:
            process.kill()
            return None, "Execution timeout (10s limit)"
        
        execution_time = time.time() - start_time
        
        avg_cpu = sum(cpu_samples) / len(cpu_samples) if cpu_samples else 8.0
        avg_memory = sum(memory_samples) / len(memory_samples) if memory_samples else 10.0
        
        energy = estimate_energy_from_metrics(avg_cpu, avg_memory, execution_time)
        
        return {
            "status": "success" if process.returncode == 0 else "error",
            "output": stdout,
            "error": stderr if process.returncode != 0 else None,
            "executionTime": round(execution_time * 1000, 2),
            "energy": energy,
            "hardware": {
                "cpu_energy": "estimated from process metrics",
                "gpu_energy": "not tracked",
                "ram_energy": "estimated"
            },
            "measurement_method": "system-metrics"
        }, None
        
    finally:
        if os.path.exists(source_file):
            os.unlink(source_file)
        if os.path.exists(executable):
            os.unlink(executable)

def measure_java_energy(code, stdin_input=""):
    """Measure Java energy using javac/java and process monitoring"""
    # Create temp source file
    with tempfile.TemporaryDirectory() as tmpdir:
        source_file = os.path.join(tmpdir, 'Main.java')
        with open(source_file, 'w') as f:
            f.write(code)
        
        try:
            # Compile
            compile_result = subprocess.run(
                ['javac', source_file],
                capture_output=True,
                text=True,
                timeout=10,
                cwd=tmpdir
            )
            
            if compile_result.returncode != 0:
                return {
                    "status": "error",
                    "error": f"Compilation error: {compile_result.stderr}",
                    "output": "",
                    "executionTime": 0
                }, None
            
            # Execute and monitor
            start_time = time.time()
            process = subprocess.Popen(
                ['java', 'Main'],
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                cwd=tmpdir
            )
            
            ps_process = psutil.Process(process.pid)
            cpu_samples = []
            memory_samples = []
            
            try:
                stdout, stderr = process.communicate(input=stdin_input, timeout=10)
                
                try:
                    cpu_percent = ps_process.cpu_percent(interval=0.1)
                    memory_mb = ps_process.memory_info().rss / 1024 / 1024
                    cpu_samples.append(cpu_percent)
                    memory_samples.append(memory_mb)
                except psutil.NoSuchProcess:
                    cpu_percent = 10.0
                    memory_mb = 80.0  # Java has higher memory overhead
            
            except subprocess.TimeoutExpired:
                process.kill()
                return None, "Execution timeout (10s limit)"
            
            execution_time = time.time() - start_time
            
            avg_cpu = sum(cpu_samples) / len(cpu_samples) if cpu_samples else 10.0
            avg_memory = sum(memory_samples) / len(memory_samples) if memory_samples else 80.0
            
            energy = estimate_energy_from_metrics(avg_cpu, avg_memory, execution_time)
            
            return {
                "status": "success" if process.returncode == 0 else "error",
                "output": stdout,
                "error": stderr if process.returncode != 0 else None,
                "executionTime": round(execution_time * 1000, 2),
                "energy": energy,
                "hardware": {
                    "cpu_energy": "estimated from process metrics",
                    "gpu_energy": "not tracked",
                    "ram_energy": "estimated (includes JVM overhead)"
                },
                "measurement_method": "system-metrics"
            }, None
            
        except Exception as e:
            return None, f"Java execution error: {str(e)}"
        
def measure_python_energy(code, stdin_input=""):
    """Measure Python energy using CodeCarbon"""
    with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False) as f:
        f.write(code)
        temp_file = f.name
    
    try:
        tracker = EmissionsTracker(save_to_file=False, logging_logger=None, log_level='error')
        tracker.start()
        start_time = time.time()
        
        result = subprocess.run(
            [sys.executable, temp_file],
            input=stdin_input,
            capture_output=True,
            text=True,
            timeout=10
        )
        
        execution_time = time.time() - start_time
        emissions_kg = tracker.stop()
        energy_kwh = tracker._total_energy.kWh if hasattr(tracker, '_total_energy') else 0
        energy_wh = energy_kwh * 1000
        energy_mj = energy_wh * 3.6
        
        return {
            "status": "success" if result.returncode == 0 else "error",
            "output": result.stdout,
            "error": result.stderr if result.returncode != 0 else None,
            "executionTime": round(execution_time * 1000, 2),
            "energy": {
                "total_kwh": round(energy_kwh, 8),
                "total_wh": round(energy_wh, 6),
                "total_mj": round(energy_mj, 2),
                "co2_emissions_kg": round(emissions_kg, 8),
                "co2_emissions_g": round(emissions_kg * 1000, 6)
            },
            "hardware": {
                "cpu_energy": "tracked via RAPL/TDP",
                "gpu_energy": "tracked if NVIDIA GPU available",
                "ram_energy": "estimated"
            },
            "measurement_method": "codecarbon"
        }, None
    except subprocess.TimeoutExpired:
        tracker.stop()
        return None, "Execution timeout (10s limit)"
    finally:
        if os.path.exists(temp_file):
            os.unlink(temp_file)

# [Keep measure_cpp_energy and measure_java_energy functions - UNCHANGED]

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "ok",
        "service": "multi-language-energy-tracker",
        "version": "2.1.0",
        "supported_languages": ["python", "javascript", "cpp", "java"],
        "ai_optimization": HF_AVAILABLE,
        "model_loaded": 'optimizer' in model_cache
    })

@app.route('/measure', methods=['POST'])
def measure_energy():
    """Execute code and measure real energy consumption"""
    try:
        data = request.json
        code = data.get('code', '')
        language = data.get('language', 'python')
        stdin_input = data.get('stdin', '')
        
        if not code:
            return jsonify({"error": "No code provided"}), 400
        
        if language == 'python':
            result, error = measure_python_energy(code, stdin_input)
        elif language == 'javascript':
            result, error = measure_javascript_energy(code, stdin_input)
        elif language == 'cpp':
            result, error = measure_cpp_energy(code, stdin_input)
        elif language == 'java':
            result, error = measure_java_energy(code, stdin_input)
        else:
            return jsonify({
                "error": f"Unsupported language: {language}",
                "supported": ["python", "javascript", "cpp", "java"]
            }), 400
        
        if error:
            return jsonify({"status": "error", "error": error}), 400
        
        return jsonify(result)
    except Exception as e:
        return jsonify({
            "status": "error",
            "error": f"Service error: {str(e)}",
            "traceback": traceback.format_exc()
        }), 500

@app.route('/optimize', methods=['POST'])
def optimize_code():
    """Get AI-powered optimization suggestions"""
    try:
        data = request.json
        code = data.get('code', '')
        language = data.get('language', 'python')
        hotspots = data.get('hotspots', [])
        use_ai = data.get('use_ai', False)
        
        if not code:
            return jsonify({"error": "No code provided"}), 400
        
        # Use AI model if requested and available
        if use_ai and HF_AVAILABLE:
            result = generate_optimization_suggestions(code, language, hotspots)
        else:
            # Fallback to rule-based suggestions
            suggestions = get_simple_optimization_suggestions(language, code, hotspots)
            result = {
                "status": "success",
                "method": "rule-based",
                "suggestions": suggestions,
                "ai_available": HF_AVAILABLE
            }
        
        return jsonify(result)
    except Exception as e:
        return jsonify({
            "status": "error",
            "error": f"Optimization failed: {str(e)}",
            "traceback": traceback.format_exc()
        }), 500

@app.route('/optimize/preload', methods=['POST'])
def preload_model():
    """Preload AI model for faster subsequent requests"""
    try:
        if not HF_AVAILABLE:
            return jsonify({
                "status": "unavailable",
                "message": "Hugging Face transformers not installed"
            }), 503
        
        model = load_optimization_model()
        if model:
            return jsonify({
                "status": "success",
                "model": model['name'],
                "message": "Model loaded and ready"
            })
        else:
            return jsonify({
                "status": "error",
                "message": "Model loading failed"
            }), 500
    except Exception as e:
        return jsonify({
            "status": "error",
            "error": str(e)
        }), 500

if __name__ == '__main__':
    print("🔋 Multi-Language Energy Measurement Service with AI")
    print("=" * 60)
    print("Starting Flask server on http://localhost:5001")
    print("Supported Languages: Python, JavaScript, C++, Java")
    print(f"AI Optimization: {'✅ Enabled' if HF_AVAILABLE else '❌ Disabled'}")
    print("=" * 60)
    app.run(host='0.0.0.0', port=5001, debug=True)