 # ML Model Benchmarking Application

## Project Overview
This project is designed to measure the performance of a Machine Learning model by evaluating its latency and throughput under different request loads.

It provides a web-based dashboard to perform predictions and view benchmarking results.

## Objectives
- Train a Machine Learning model.
- Create a prediction API using FastAPI.
- Measure model response latency.
- Calculate throughput under different workloads.
- Visualize performance using graphs.
- Display benchmarking results through a dashboard.

## Technologies Used
- Python 3.11
- FastAPI
- Scikit-learn
- Pandas
- NumPy
- Matplotlib
- HTML
- CSS
- JavaScript
- Requests

## Project Structure
```text
ML_Model_Benchmarking/
├── model/
│   ├── train_model.py
│   └── ml_model.pkl
├── api/
│   └── main.py
├── benchmarking/
│   └── benchmark.py
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── app.js
├── results/
│   └── benchmark_results.csv
├── graphs/
│   ├── latency_graph.png
│   ├── throughput_graph.png
│   └── latency_distribution.png
├── requirements.txt
└── README.md
```

## Installation

1. Clone or download this repository.
2. Open the project folder in VS Code.
3. Create a virtual environment:

```bash
py -m venv venv
```

4. Activate the environment in PowerShell:

```powershell
.\venv\Scripts\Activate.ps1
```

5. Install the required packages:

```bash
pip install -r requirements.txt
```

## Run the Application

### Step 1: Train the ML Model

```bash
py model/train_model.py
```

### Step 2: Start the API

```bash
py -m uvicorn api.main:app --reload
```

Open the API documentation at:

http://127.0.0.1:8000/docs

### Step 3: Run Benchmarking

Open a second terminal, activate the virtual environment, and execute:

```bash
py benchmarking/benchmark.py
```

### Step 4: Open the Dashboard

Open:

http://127.0.0.1:8000

## Benchmark Results

The application tests different request loads and concurrency levels.

For the 1,000-request test, the observed results were:

| Metric | Result |
|---|---:|
| Total Requests | 1,000 |
| Successful Requests | 1,000 |
| Failed Requests | 0 |
| Average Latency | 95.63 ms |
| P95 Latency | 141.85 ms |
| Throughput | 482.91 requests/sec |

These measurements represent client-observed HTTP request-response performance in the local environment.

## Generated Outputs

The application generates:

- `results/benchmark_results.csv`
- `graphs/latency_graph.png`
- `graphs/throughput_graph.png`
- `graphs/latency_distribution.png`

## Conclusion

This project demonstrates how Machine Learning model performance can be evaluated using latency and throughput measurements. It combines a trained ML model, FastAPI, automated benchmarking, data visualization, and a web dashboard to provide an understanding of model performance under different workloads.
