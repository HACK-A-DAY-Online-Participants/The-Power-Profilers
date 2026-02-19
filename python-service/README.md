# Multi-Language Energy Measurement Service

Python microservice for real hardware energy measurement across multiple languages.

## Setup

1. **Install System Dependencies:**

   **For JavaScript (Node.js):**
   ```bash
   node --version  # Should already be installed
   ```

   **For C++:**
   ```bash
   # Ubuntu/Debian
   sudo apt install g++
   
   # macOS
   xcode-select --install
   
   # Windows
   # Install MinGW or Visual Studio with C++ tools
   ```

   **For Java:**
   ```bash
   # Ubuntu/Debian
   sudo apt install default-jdk
   
   # macOS
   brew install openjdk
   
   # Windows
   # Download from https://www.oracle.com/java/technologies/downloads/
   ```

2. **Create virtual environment:**
   ```bash
   cd python-service
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run service:**
   ```bash
   python energy_service.py
   ```

Service will run on `http://localhost:5001`

## Supported Languages

| Language   | Measurement Method              | Accuracy |
|------------|---------------------------------|----------|
| Python     | CodeCarbon (Hardware RAPL/TDP)  | High     |
| JavaScript | Process Monitoring (CPU + RAM)  | Medium   |
| C++        | Process Monitoring (CPU + RAM)  | Medium   |
| Java       | Process Monitoring (CPU + RAM)  | Medium   |

## API Endpoints

### GET /health
Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "service": "multi-language-energy-tracker",
  "version": "2.0.0",
  "supported_languages": ["python", "javascript", "cpp", "java"]
}
```

### POST /measure
Measure energy consumption for code execution.

**Request:**
```json
{
  "language": "javascript",
  "code": "console.log('Hello');",
  "stdin": ""
}
```

**Response:**
```json
{
  "status": "success",
  "output": "Hello\n",
  "executionTime": 45.2,
  "energy": {
    "total_kwh": 0.000012,
    "total_wh": 0.012,
    "total_mj": 0.043,
    "co2_emissions_kg": 0.000005,
    "co2_emissions_g": 0.005
  },
  "hardware": {
    "cpu_energy": "estimated from process metrics",
    "gpu_energy": "not tracked",
    "ram_energy": "estimated"
  },
  "measurement_method": "system-metrics"
}
```

## Troubleshooting

### "Command not found" errors

Make sure the respective compilers/interpreters are installed:
- **JavaScript**: `node --version`
- **C++**: `g++ --version`
- **Java**: `javac --version`
- **Python**: `python --version`

### Port already in use

If port 5001 is busy, change it in `energy_service.py`:
```python
app.run(host='0.0.0.0', port=5002, debug=True)
```

And update `.env.local` in Next.js:
```
PYTHON_SERVICE_URL=http://localhost:5002
```

### Permission denied (Linux/macOS)

For CodeCarbon to access hardware metrics:
```bash
sudo chmod +r /sys/class/powercap/intel-rapl/*/energy_uj
```