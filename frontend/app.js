
async function getPrediction() {
    const button = document.getElementById("predictBtn");
    const resultBox = document.getElementById("predictionResult");

    const rawValues = document.getElementById("features").value;

    const features = rawValues
        .split(/[\s,]+/)
        .filter(value => value.trim() !== "")
        .map(Number);

    if (features.length !== 30 || features.some(value => !Number.isFinite(value))) {
        showMessage("Please enter exactly 30 valid numerical features.", true);
        return;
    }

    button.disabled = true;
    button.textContent = "Predicting...";

    try {
        const response = await fetch("/predict", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ features: features })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || "Prediction failed.");
        }

        resultBox.className = "result";
        resultBox.innerHTML = `
            <h3>Prediction Result: ${data.result}</h3>
            <p>Malignant confidence: ${(data.probability.malignant * 100).toFixed(2)}%</p>
            <p>Benign confidence: ${(data.probability.benign * 100).toFixed(2)}%</p>
        `;

    } catch (error) {
        showMessage(error.message, true);
    } finally {
        button.disabled = false;
        button.textContent = "⚡ Get Prediction";
    }
}

function showMessage(message, isError) {
    const resultBox = document.getElementById("predictionResult");
    resultBox.className = "result" + (isError ? " error" : "");
    resultBox.textContent = message;
}

async function loadResults() {
    const status = document.getElementById("statusMessage");

    try {
        status.textContent = "Loading benchmark results...";

        const response = await fetch("/benchmark-results");

        if (!response.ok) {
            throw new Error("Benchmark results are not available yet.");
        }

        const data = await response.json();

        if (!data.length) {
            throw new Error("No benchmark data found. Run benchmark.py first.");
        }

        const latest = data[data.length - 1];

        document.getElementById("latency").textContent =
            Number(latest["Average Latency (ms)"]).toFixed(2) + " ms";

        document.getElementById("throughput").textContent =
            Number(latest["Throughput (requests/sec)"]).toFixed(2) + " req/sec";

        const total = Number(latest["Successful Requests"]) +
                      Number(latest["Failed Requests"]);

        const rate = total
            ? Number(latest["Successful Requests"]) / total * 100
            : 0;

        document.getElementById("successRate").textContent =
            rate.toFixed(2) + "%";

        drawChart(
            "latencyChart",
            data,
            "Average Latency (ms)",
            "Average latency (ms)",
            "#5944c7"
        );

        drawChart(
            "throughputChart",
            data,
            "Throughput (requests/sec)",
            "Throughput (req/sec)",
            "#168b48"
        );

        drawDistribution(data);

        status.textContent = "Benchmark results loaded successfully.";

    } catch (error) {
        status.textContent = error.message;
    }
}

function drawChart(canvasId, data, field, label, color) {
    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext("2d");

    const width = canvas.clientWidth;
    const height = 220;

    canvas.width = width;
    canvas.height = height;

    ctx.clearRect(0, 0, width, height);

    const values = data.map(item => Number(item[field]));
    const labels = data.map(item => item["Total Requests"]);

    const maxValue = Math.max(...values, 1) * 1.15;
    const left = 45;
    const right = width - 15;
    const top = 15;
    const bottom = height - 35;

    ctx.font = "11px Arial";
    ctx.strokeStyle = "#dddddd";
    ctx.fillStyle = "#666666";

    for (let i = 0; i <= 4; i++) {
        const y = bottom - (bottom - top) * i / 4;

        ctx.beginPath();
        ctx.moveTo(left, y);
        ctx.lineTo(right, y);
        ctx.stroke();

        ctx.fillText(
            (maxValue * i / 4).toFixed(0),
            5,
            y + 4
        );
    }

    const points = values.map((value, i) => ({
        x: left + (right - left) * i / Math.max(values.length - 1, 1),
        y: bottom - (bottom - top) * value / maxValue
    }));

    if (points.length > 1) {
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 2.5;

        points.forEach((point, i) => {
            if (i === 0) ctx.moveTo(point.x, point.y);
            else ctx.lineTo(point.x, point.y);
        });

        ctx.stroke();
    }

    points.forEach((point, i) => {
        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#555";
        ctx.fillText(String(labels[i]), point.x - 10, bottom + 18);
    });

    ctx.fillStyle = "#333";
    ctx.fillText(label, left, height - 5);
}

function drawDistribution(data) {
    const canvas = document.getElementById("distributionChart");
    const ctx = canvas.getContext("2d");

    const width = canvas.clientWidth;
    const height = 220;

    canvas.width = width;
    canvas.height = height;

    ctx.clearRect(0, 0, width, height);

    const values = data.map(item =>
        Number(item["Average Latency (ms)"])
    );

    const bins = 6;
    const max = Math.max(...values, 1);
    const counts = Array(bins).fill(0);

    values.forEach(value => {
        const index = Math.min(
            Math.floor(value / (max + 1) * bins),
            bins - 1
        );
        counts[index]++;
    });

    const highest = Math.max(...counts, 1);
    const chartBottom = height - 30;
    const chartTop = 15;
    const chartHeight = chartBottom - chartTop;
    const barWidth = (width - 45) / bins;

    counts.forEach((count, i) => {
        const barHeight = count / highest * chartHeight;

        ctx.fillStyle = "#8d79dc";
        ctx.fillRect(
            30 + i * barWidth,
            chartBottom - barHeight,
            barWidth - 5,
            barHeight
        );
    });

    ctx.fillStyle = "#555";
    ctx.font = "11px Arial";
    ctx.fillText("Latency groups (based on averages)", 30, height - 8);
}

window.addEventListener("load", loadResults);
