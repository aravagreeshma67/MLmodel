 
import os
import time
import requests
import pandas as pd
import matplotlib.pyplot as plt

from concurrent.futures import ThreadPoolExecutor
from sklearn.datasets import load_breast_cancer

API_URL = "http://127.0.0.1:8000/predict"

data = load_breast_cancer()
sample_input = data.data[0].tolist()

test_cases = [
    (10, 1),
    (50, 5),
    (100, 10),
    (500, 20),
    (1000, 50)
]

os.makedirs("results", exist_ok=True)
os.makedirs("graphs", exist_ok=True)

def send_request():
    start = time.perf_counter()

    try:
        response = requests.post(
            API_URL,
            json={"features": sample_input},
            timeout=30
        )

        latency = (time.perf_counter() - start) * 1000

        return latency, response.status_code == 200

    except requests.RequestException:
        latency = (time.perf_counter() - start) * 1000
        return latency, False


results = []
all_latencies = []

print("Starting ML Model Benchmarking...", flush=True)

for total_requests, concurrency in test_cases:

    print("\nRequests:", total_requests, flush=True)
    print("Concurrency:", concurrency, flush=True)

    start_time = time.perf_counter()

    with ThreadPoolExecutor(max_workers=concurrency) as executor:
        output = list(
            executor.map(
                lambda _: send_request(),
                range(total_requests)
            )
        )

    total_time = time.perf_counter() - start_time

    latencies = [item[0] for item in output]
    successful = sum(item[1] for item in output)
    failed = total_requests - successful

    all_latencies.extend(latencies)

    average = sum(latencies) / len(latencies)
    minimum = min(latencies)
    maximum = max(latencies)
    p95 = pd.Series(latencies).quantile(0.95)
    throughput = successful / total_time

    results.append({
        "Total Requests": total_requests,
        "Concurrency": concurrency,
        "Successful Requests": successful,
        "Failed Requests": failed,
        "Average Latency (ms)": average,
        "Minimum Latency (ms)": minimum,
        "Maximum Latency (ms)": maximum,
        "P95 Latency (ms)": p95,
        "Throughput (requests/sec)": throughput
    })

    print("Successful:", successful, flush=True)
    print("Failed:", failed, flush=True)
    print("Average Latency:", round(average, 2), "ms", flush=True)
    print("P95 Latency:", round(p95, 2), "ms", flush=True)
    print("Throughput:", round(throughput, 2), "requests/sec", flush=True)


df = pd.DataFrame(results)

df.to_csv("results/benchmark_results.csv", index=False)

plt.figure(figsize=(9, 5))
plt.plot(df["Total Requests"], df["Average Latency (ms)"], marker="o")
plt.xlabel("Total Requests")
plt.ylabel("Average Latency (ms)")
plt.title("Latency vs Number of Requests")
plt.grid(True)
plt.savefig("graphs/latency_graph.png")
plt.close()

plt.figure(figsize=(9, 5))
plt.plot(df["Total Requests"], df["Throughput (requests/sec)"], marker="o")
plt.xlabel("Total Requests")
plt.ylabel("Throughput (requests/sec)")
plt.title("Throughput vs Number of Requests")
plt.grid(True)
plt.savefig("graphs/throughput_graph.png")
plt.close()

plt.figure(figsize=(9, 5))
plt.hist(all_latencies, bins=30)
plt.xlabel("Response Time (ms)")
plt.ylabel("Frequency")
plt.title("Response Time Distribution")
plt.grid(True)
plt.savefig("graphs/latency_distribution.png")
plt.close()

print("\nBenchmarking Completed!", flush=True)
print("CSV saved in results folder.", flush=True)
print("All three graphs saved in graphs folder.", flush=True)
