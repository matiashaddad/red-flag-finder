from sklearn.ensemble import IsolationForest
import pandas as pd
import joblib
from .config import ANOMALY_THRESHOLD

def train_and_score_isolation_forest(df: pd.DataFrame) -> pd.DataFrame:
    # Trains Isolation Forest -> generate an anomaly score
    # 1. Feature Selection (numerical)
    features = ['amount', 'time_since_last_txn', 'monthly_spending']

    # 2. Model Training
    model = IsolationForest(contamination='auto', random_state=42)
    model.fit(df[features])

    # 3. Anomaly Scoring
    # Negative decision function of the outlier score for a Red Flag Score
    anomaly_scores = -model.decision_function(df[features])
    df['anomaly_score'] = anomaly_scores

    # Flag top transactions as anomalous based on score
    threshold = df['anomaly_score'].quantile(1 - ANOMALY_THRESHOLD)
    df['is_anomaly'] = (df['anomaly_score'] > threshold).astype(int)

    return df
