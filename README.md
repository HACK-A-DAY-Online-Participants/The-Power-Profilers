# ⚡ Energy API — Code Energy Profiler (API 2.0)

The **Energy API** is a lightweight Flask-based service that executes code
(Python, C++, Java) and measures:

- ⚡ **Total energy consumption (in Joules)**
- ⏱ **Execution time (in seconds)**
- 📤 **Program output (stdout)**
- ❗ **Runtime errors (stderr)**

This project powers the **Energy CLI** and **VS Code Energy Profiler extension**.

---

## 📌 Features

✔ Run Python, C++ and Java programs  
✔ Measure execution time  
✔ Estimate energy usage using a calibrated CPU-time model  
✔ Simple REST API (`/compile`)  
✔ Works with the CLI via:  
```sh
energy myfile.py



📁 Project Structure
EnergyAPI/
│
├── server.py              # Main API entry point
├── requirements.txt       # Python dependencies
│
├── compiler/
│   ├── python.py          # Python executor & energy model
│   ├── cpp.py             # C++ executor
│   ├── java.py            # Java executor
│   └── exec_utils.py      # Utility to run commands safely
│
└── cli.py                 # CLI Client (optional usage)


🚀 Getting Started
1️⃣ Clone the repository
git clone <your-repo-url>
cd EnergyAPI


Make sure you are on the correct branch:

git checkout api-2.0

2️⃣ Install Requirements

Use a virtual environment (recommended):

python -m venv venv
venv\Scripts\activate   # Windows
source venv/bin/activate  # Mac/Linux


Install dependencies:

pip install -r requirements.txt

3️⃣ Start the Energy API
python server.py


You should see:

🔥 Energy API running on port 3000
 * Running on http://127.0.0.1:3000

📡 API Usage
POST /compile

Execute Python, C++, or Java code and get energy/time stats.

📤 Request Body
{
  "language": "python",
  "code": "print(123)"
}

Supported languages:
Language	Value
Python	"python"
C++	"cpp"
Java	"java"
📥 Example cURL Command
curl -X POST http://127.0.0.1:3000/compile ^
     -H "Content-Type: application/json" ^
     -d "{\"language\":\"python\", \"code\":\"print(123)\"}"

📦 Example API Response
{
  "energy_j": 0.03421,
  "time_s": 0.27186,
  "stdout": "123\n",
  "stderr": "",
  "return_code": 0
}

🖥 CLI Usage (Optional)

After placing energy.bat in PATH:

energy mycode.py


Output:

⚡ ENERGY REPORT --------------------------
Total Energy: 0.03420 J
Total Time:   0.27180 s
Stdout:       123

🛠 Technology Used

Python 3.x

Flask (REST API)

subprocess for execution

C++/G++ compiler

Java/JDK runtime

🤝 Contributing

Create a new branch:

git checkout -b feature/my-feature


Commit changes:

git commit -m "Add new feature"


Push branch:

git push origin feature/my-feature


Open a pull request.

📜 License

This project is for Hack-A-Day and internal use.
All rights reserved.
