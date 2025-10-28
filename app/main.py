from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import contextlib
from .data_handler import load_data_and_engineer_features, simulate_intermediate_sql_query, TRANSACTIONS_DF, MODEL_PERFORMANCE_REPORT

@contextlib.asynccontextmanager
async def lifespan(app: FastAPI):
    # App's lifecycle
    print("Loading Data and Training ML")
    load_data_and_engineer_features()

    # Yield: App ready
    yield

    print("Finalizing App...")

app = FastAPI(
    title="Red Flag: FinTech Anomaly Explorer API",
    version="1.0.0",
    description="Backend API for anomaly detection and analysis.",
    lifespan=lifespan
)

# CORS config to allow React frontend to fetch data
origins = [
    "http://localhost:3000", # React
    "http://127.0.0.1:3000",
    "*" # For simpler deployment to GH Pages
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Endpoints

@app.get("/api/summary")
def get_summary_data():
    # Returns result of simulated SQL query (Top 10 Users)
    return simulate_intermediate_sql_query()

@app.get("/api/anomalies")
def get_anomalies():
    # Returns a list of anomalies by ML Algorithm
    if TRANSACTIONS_DF is None or TRANSACTIONS_DF.empty:
        raise HTTPException(status_code=503, detail="Data not available.")

    anomalies = TRANSACTIONS_DF[TRANSACTIONS_DF['is_anomaly'] == 1].copy()

    # Relevant fields for the frontend -> convert to list of dicts
    display_fields = ['transaction_id', 'user_id', 'amount', 'timestamp', 'anomaly_score', 'type']

    # Timestamp
    anomalies['timestamp'] = anomalies['timestamp'].dt.isoformat()
    anomalies['anomaly_score'] = anomalies['anomaly_score'].round(4)

    return anomalies[display_fields].to_dict('records')

@app.get("/api/transactions")
def get_all_transactions():
    # Returns list of all transactions
    if TRANSACTIONS_DF is None or TRANSACTIONS_DF.empty:
        raise HTTPException(status_code=503, detail="Data not available.")

    # Limit to a manageable number for simple MVP
    display_df = TRANSACTIONS_DF.head(1000).copy()

    display_fields = ['transaction_id', 'user_id', 'amount', 'timestamp', 'is_fraud', 'is_anomaly']
    display_df['timestamp'] = display_df['timestamp'].dt.isoformat()

    return display_df[display_fields].to_dict('records')

@app.get("/api/model_metrics")
def get_model_metrics():
    # Returns the classification report (Precision, Recall, F1-Score)
    if not MODEL_PERFORMANCE_REPORT:
        raise HTTPException(status_code=503, detail="Model metrics not calculated.")

    return {"report": MODEL_PERFORMANCE_REPORT}
# Run App: uvicorn app.main:app --reload
