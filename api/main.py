
import os
import json
import joblib
import pandas as pd

from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field


# Load trained model
model = joblib.load("model/ml_model.pkl")

# Create FastAPI application
app = FastAPI(
    title="ML Model Benchmarking API",
    description="API for measuring ML model performance",
    version="1.0"
)


# Input format
class PredictionInput(BaseModel):
    features: list[float] = Field(min_length=30, max_length=30)


# Home endpoint
@app.get("/api")
def home():
    return {
        "message": "ML Model Benchmarking API is running"
    }


# Health check
@app.get("/health")
def health():
    return {
        "status": "healthy"
    }


# Prediction endpoint
@app.post("/predict")
def predict(data: PredictionInput):

    try:
        prediction = model.predict([data.features])[0]

        probability = model.predict_proba([data.features])[0]

        result = "Malignant" if prediction == 0 else "Benign"

        return {
            "prediction": int(prediction),
            "result": result,
            "probability": {
                "malignant": float(probability[0]),
                "benign": float(probability[1])
            }
        }

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=str(error)
        )


# Benchmark results endpoint
@app.get("/benchmark-results")
def benchmark_results():

    file_path = "results/benchmark_results.csv"

    if not os.path.exists(file_path):
        raise HTTPException(
            status_code=404,
            detail="Benchmark results not found. Run benchmark.py first."
        )

    df = pd.read_csv(file_path)

    return json.loads(df.to_json(orient="records"))


# Display frontend website
app.mount(
    "/",
    StaticFiles(directory="frontend", html=True),
    name="frontend"
)
