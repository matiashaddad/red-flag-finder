# FinTech Anomaly Explorer

This App is designed to detect and visualize anomalies in financial transaction data using a Python FastAPI backend and a React frontend.

# How to Run the Application

The App requires two separate processes to be running simultaneously: the Python backend and the React frontend.

1. Backend Setup

From the root directory:

-Activate the Virtual Environment:
source venv/bin/activate (on macOS/Linux)
venv\Scripts\activate (on Windows)

-Install Python Dependencies:
pip install -r requirements.txt

-Start the API Server:
This process will automatically download the required CSV data, train the Isolation Forest model, and start the API on http://127.0.0.1:8000.

uvicorn app.main:app --reload

2. Frontend Setup

-Go to the Frontend Directory (red_flag_finder_frontend/):
cd red_flag_finder_frontend

-Install JavaScript Dependencies:
npm install

-Start Development Server:
This will compile the React code and open the App in your browser at http://localhost:3000.
npm start

The frontend will automatically connect to the FastAPI backend to fetch and display the anomaly data.
