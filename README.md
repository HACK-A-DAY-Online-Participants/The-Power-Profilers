# ⚡ Code Energy Profiler

> **Measure, analyze, and optimize your code's energy consumption in real-time**

A full-stack web application that helps developers write energy-efficient code by providing real-time energy measurements, AI-powered optimization suggestions, and multi-language support.

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-3.11-green)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/Flask-3.0-lightgrey)](https://flask.palletsprojects.com/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

![Demo Screenshot](demo-screenshot.png)

---

## 🌟 Features

- ⚡ **Real-time Energy Measurement** - Track actual CPU, GPU, and RAM energy consumption
- 🤖 **AI-Powered Optimization** - Get intelligent suggestions to improve code efficiency
- 🌍 **Multi-Language Support** - JavaScript, Python, C++, and Java
- 📊 **Energy Analytics** - Visualize hotspots, metrics, and carbon footprint
- 🎨 **Modern UI** - Dark/Light themes with Monaco Editor (VS Code experience)
- 💾 **Code Persistence** - Auto-save your code across sessions
- 🔒 **Secure Execution** - Sandboxed code execution with timeout limits

---

## 🚀 Quick Start

### Prerequisites

Make sure you have the following installed:

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **Python** 3.10+ ([Download](https://www.python.org/))
- **Git** ([Download](https://git-scm.com/))

**For full language support, also install:**
- **GCC/G++** for C++ support
- **OpenJDK** 15+ for Java support

---

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/Anik-08/Code-profiler-website.git
cd Code-profiler-website
```

---

### 2️⃣ Frontend Setup (Next.js)

```bash
# Install dependencies
npm install
# or
yarn install
# or
pnpm install

# Create environment file
cp .env.example .env.local

# Start development server
npm run dev
```

The frontend will be available at **http://localhost:3000**

---

### 3️⃣ Backend Setup (Python Service)

Open a **new terminal window**:

```bash
# Navigate to Python service
cd python-service

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate

# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the backend service
python energy_service.py
```

The backend will be available at **http://localhost:5001**

---

### 4️⃣ Verify Installation

Open your browser and navigate to **http://localhost:3000**

You should see:
- ✅ Code editor with syntax highlighting
- ✅ Language selector (JavaScript, Python, C++, Java)
- ✅ Run & Analyze buttons
- ✅ Theme toggle (sun/moon icon)

**Test the setup:**
1. Select a language
2. Click "Run & Analyze"
3. Check if energy metrics appear

---

## 🚀 Quick Start Guide

### 5-Minute Setup

### Step 1: Clone and Install
```bash
git clone https://github.com/Anik-08/Code-profiler-website.git
cd Code-profiler-website
npm install
```

### Step 2: Setup Backend
```bash
cd python-service
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python energy_service.py
```

### Step 3: Start Frontend
```bash
# In new terminal, from project root
npm run dev
```

### Step 4: Open Browser
Visit http://localhost:3000

**That's it! 🎉**