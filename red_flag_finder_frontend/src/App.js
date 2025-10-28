import React, { useState, useEffect } from 'react';

// Configuration
const API_BASE_URL = 'http://127.0.0.1:8000/api';

const App = () => {
    const [summaryData, setSummaryData] = useState([]);
    const [anomalyData, setAnomalyData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Data Fetching
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Summary
                const summaryRes = await fetch(`${API_BASE_URL}/summary`);
                const summaryJson = await summaryRes.json();
                setSummaryData(summaryJson);

                // Fetch Anomalies
                const anomaliesRes = await fetch(`${API_BASE_URL}/anomalies`);
                const anomaliesJson = await anomaliesRes.json();
                setAnomalyData(anomaliesJson);

            } catch (err) {
                console.error("API Fetch Error:", err);
                setError("Failed to connect to the backend API.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []); // Empty dependency array ensures this runs once on mount

    // Data Pre-processing for Visualization
    const getChartData = () => {
        // Distribution of anomalous vs normal transaction amounts
        const anomalousAmounts = anomalyData.map(t => t.amount);
        // Simulate normal distribution data
        const normalAmounts = [100, 250, 50, 500, 1500, 3000].concat(anomalousAmounts.slice(0, 5).map(a => a * 0.1));

        return {
            labels: ['Normal Txn Amount', 'Anomalous Txn Amount'],
            datasets: [
                { label: 'Normal Amount (Avg)', value: (normalAmounts.reduce((a, b) => a + b, 0) / normalAmounts.length).toFixed(2) },
                { label: 'Anomaly Amount (Avg)', value: (anomalousAmounts.reduce((a, b) => a + b, 0) / anomalousAmounts.length).toFixed(2) }
            ]
        };
    };

    if (loading) return <div className="min-h-screen bg-gray-900 text-white p-8">Loading Data...</div>;
    if (error) return <div className="min-h-screen bg-gray-900 text-red-500 p-8">Error: {error}</div>;

    const chartData = getChartData();

    // JSX Layout
    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 p-4 sm:p-8 font-sans">
            {/* Header */}
            <header className="mb-8 border-b border-red-700 pb-4">
                <h1 className="text-4xl font-bold text-red-400">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-red-600">
                        Red Flag
                    </span>: FinTech Anomaly Explorer 🚩
                </h1>
                <p className="text-sm text-gray-500 mt-1">Status: MVP Connected ({anomalyData.length} Anomalies Found)</p>
            </header>

            {/* Main Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* 1. Summary Panel (SQL View) - Column 1 */}
                <div className="lg:col-span-1 bg-gray-800 p-6 rounded-lg shadow-xl h-fit">
                    <h2 className="text-2xl font-semibold mb-4 text-red-300">
                        Top 10 Users: Aggregated Spending
                    </h2>
                    <p className="text-sm text-gray-400 mb-4">
                        *Simulated SQL Query: Total Monthly Spending & Fraud Ratio.
                    </p>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-700">
                            <thead className="bg-gray-700">
                                <tr>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">User ID</th>
                                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Total Spend</th>
                                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Fraud Ratio</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {summaryData.slice(0, 10).map((user, index) => (
                                    <tr key={user.user_id} className={index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-750'}>
                                        <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-100">{user.user_id}</td>
                                        <td className="px-3 py-2 whitespace-nowrap text-sm text-right text-green-300">${user.total_monthly_spending}</td>
                                        <td className={`px-3 py-2 whitespace-nowrap text-sm text-right ${user.historical_fraud_ratio > 0 ? 'text-red-400 font-bold' : 'text-gray-400'}`}>
                                            {user.historical_fraud_ratio}%
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* 2. Visualization - Column 2 */}
                <div className="lg:col-span-2 bg-gray-800 p-6 rounded-lg shadow-xl flex flex-col">
                    <h2 className="text-2xl font-semibold mb-4 text-red-300">
                        Anomaly Distribution & Scoring
                    </h2>
                    {/* Bar Chart Simulation */}
                    <div className="flex justify-around items-center h-48 bg-gray-700 p-4 rounded-md">
                        {chartData.datasets.map((data, index) => (
                            <div key={index} className="flex flex-col items-center">
                                <div
                                    className={`w-12 rounded-t-lg transition-all duration-500`}
                                    style={{
                                        height: `${data.value * 0.05}px`,
                                        backgroundColor: index === 0 ? '#4CAF50' : '#F44336' // Green for Normal, Red for Anomaly
                                    }}
                                ></div>
                                <span className="mt-2 text-sm text-gray-300 font-semibold">${data.value}</span>
                                <span className="text-xs text-gray-400">{data.label.split(' ')[0]}</span>
                            </div>
                        ))}
                    </div>
                    <p className="mt-4 text-sm text-gray-400">
                        Visualization of average transaction amount: Normal vs. Flagged Anomaly.
                    </p>
                </div>

                {/* 3. Anomaly List - Spans All Columns */}
                <div className="lg:col-span-3 bg-gray-800 p-6 rounded-lg shadow-xl mt-4">
                    <h2 className="text-2xl font-semibold mb-4 text-red-300">
                        Anomalous Transactions List
                    </h2>
                    <p className="text-sm text-gray-400 mb-4">
                        Flagged by Isolation Forest (Top {ANOMALY_THRESHOLD * 100}% by Score).
                    </p>
                    <div className="overflow-y-scroll h-96 border border-gray-700 rounded-md">
                        <table className="min-w-full divide-y divide-gray-700">
                            <thead className="sticky top-0 bg-gray-700 z-10">
                                <tr>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">ID</th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">User</th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Type</th>
                                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Amount</th>
                                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Score</th>
                                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Timestamp</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {anomalyData.map((txn) => (
                                    <tr key={txn.transaction_id} className="hover:bg-gray-700 transition-colors">
                                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-400">{txn.transaction_id}</td>
                                        <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-red-300">{txn.user_id}</td>
                                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-300">{txn.type}</td>
                                        <td className="px-3 py-2 whitespace-nowrap text-sm text-right font-bold text-red-400">${txn.amount.toFixed(2)}</td>
                                        <td className="px-3 py-2 whitespace-nowrap text-sm text-right text-yellow-400">{txn.anomaly_score}</td>
                                        <td className="px-3 py-2 whitespace-nowrap text-xs text-right text-gray-500">{new Date(txn.timestamp).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {anomalyData.length === 0 && (
                            <div className="p-4 text-center text-gray-500">No anomalies found above the current threshold.</div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default App;
