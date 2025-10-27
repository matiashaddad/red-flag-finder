import pandas as pd
from datetime import datetime
from .ml_models import train_and_score_isolation_forest
from .config import DATA_PATH

# Global variable for processed DataFrame
TRANSACTIONS_DF: pd.DataFrame = None

def load_data_and_engineer_features() -> pd.DataFrame:
    # Load CSV + features + ML scoring
    global TRANSACTIONS_DF

    # 1. Load Data
    try:
        df = pd.read_csv(DATA_PATH)
    except FileNotFoundError:
        print(f"ERROR: {DATA_PATH} not found. Please create a mock file.")
        return pd.DataFrame()

    # 2. Feature Engineering
    df['timestamp'] = pd.to_datetime(df['timestamp'])
    df['month'] = df['timestamp'].dt.to_period('M')

    # Days of week
    df['day_of_week'] = df['timestamp'].dt.dayofweek

    # Categorical Encoding: simple one-hot for 'type'
    df = pd.get_dummies(df, columns=['type'], prefix='type', drop_first=True)

    # 3. Calculate Aggregated Features for ML
    user_agg = df.groupby('user_id')['amount'].agg(['mean', 'count']).reset_index()
    user_agg.columns = ['user_id', 'avg_user_amount', 'user_txn_count']
    df = df.merge(user_agg, on='user_id', how='left')

    # 4. ML Anomaly Scoring
    df = train_and_score_isolation_forest(df)

    TRANSACTIONS_DF = df
    print("Data loaded, features engineered and scored successfully.")
    return df

def simulate_intermediate_sql_query() -> dict:
    # Top 10 users' spending, average and fraud ratio
    if TRANSACTIONS_DF is None or TRANSACTIONS_DF.empty:
        return {"error": "Data not loaded."}

    df = TRANSACTIONS_DF.copy()

    # 1. Top 10 Most Active Users
    top_10_users = df['user_id'].value_counts().nlargest(10).index
    df_top = df[df['user_id'].isin(top_10_users)]

    # 2. Calculate Aggregations
    summary = df_top.groupby('user_id').agg(
        total_monthly_spending=('amount', 'sum'),
        avg_transaction_amount=('amount', 'mean'),
        total_transactions=('transaction_id', 'count'),
        total_fraudulent_txns=('is_fraud', 'sum') # Assumes is_fraud is 0/1
    ).reset_index()

    # 3. Historical Fraud Ratio
    summary['historical_fraud_ratio'] = (summary['total_fraudulent_txns'] / summary['total_transactions']) * 100

    # Convert Period to String for JSON serialization
    summary['total_monthly_spending'] = summary['total_monthly_spending'].round(2)
    summary['avg_transaction_amount'] = summary['avg_transaction_amount'].round(2)
    summary['historical_fraud_ratio'] = summary['historical_fraud_ratio'].round(4)

    return summary.sort_values(by='total_monthly_spending', ascending=False).to_dict('records')
