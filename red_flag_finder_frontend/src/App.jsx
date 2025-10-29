import React, { useState, useEffect } from 'react';

// Configuration
const API_BASE_URL = 'http://127.0.0.1:8000/api';

// Const needed for display purposes
const ANOMALY_THRESHOLD = 0.1; // 10% of transactions are flagged as anomalous

const App = () => {
    // State initialization
    const [summaryData, setSummaryData] = useState([]);
    const [anomalyData, setAnomalyData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Effect hook for data fetching on component mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Summary Data
                const summaryRes = await fetch(`${API_BASE_URL}/summary`);
                if (!summaryRes.ok) throw new Error(`HTTP error! status: ${summaryRes.status} on summary`);
                const summaryJson = await summaryRes.json();
                setSummaryData(summaryJson);

                // Fetch Anomalies Data
                const anomaliesRes = await fetch(`${API_BASE_URL}/anomalies`);
                if (!anomaliesRes.ok) throw new Error(`HTTP error! status: ${anomaliesRes.status} on anomalies`);
                const anomaliesJson = await anomaliesRes.json();
                setAnomalyData(anomaliesJson);

            } catch (err) {
                console.error("API Fetch Error:", err);
                // Set a user-friendly error message
                setError(`Fail connecting to the API backend. Make sure FastAPI is running. Detail: ${err.message}`);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []); // Run only once on initial component mount

    // Data preprocessing function for visualization simulation
    const getChartData = () => {
        if (anomalyData.length === 0) {
            return {
                labels: ['Normal Txn Amount', 'Anomalous Txn Amount'],
                datasets: [
                    { label: 'Normal Amount (Avg)', value: 0 },
                    { label: 'Anomaly Amount (Avg)', value: 0 }
                ]
            };
        }

        const anomalousAmounts = anomalyData.map(t => t.amount);

        // Simulate normal transaction data for a baseline comparison in the chart
        const normalAmounts = Array.from({ length: 100 }, (_, i) =>
            (Math.random() * 500 + 50) * (1 - ANOMALY_THRESHOLD)
        );

        const avgNormal = normalAmounts.length > 0
            ? (normalAmounts.reduce((a, b) => a + b, 0) / normalAmounts.length).toFixed(2)
            : 0;

        const avgAnomaly = anomalousAmounts.length > 0
            ? (anomalousAmounts.reduce((a, b) => a + b, 0) / anomalousAmounts.length).toFixed(2)
            : 0;

        return {
            labels: ['Normal Txn Amount', 'Anomalous Txn Amount'],
            datasets: [
                { label: 'Normal Amount (Avg)', value: parseFloat(avgNormal) },
                { label: 'Anomaly Amount (Avg)', value: parseFloat(avgAnomaly) }
            ]
        };
    };

    // Conditional rendering for loading and error states
    if (loading) return <div className="min-h-screen bg-gray-900 text-white p-8 flex items-center justify-center text-3xl">Cargando Datos...</div>;
    if (error) return <div className="min-h-screen bg-gray-900 text-red-500 p-8 flex items-center justify-center text-xl">Error: {error}</div>;

    const chartData = getChartData();

    // Main component layout
    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 p-4 sm:p-8 font-sans">
            {/* Header section */}
            <header className="mb-8 border-b border-red-700 pb-4">
                <h1 className="text-4xl font-bold text-red-400">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-red-600">
                        Red Flag
                    </span>: FinTech Anomaly Explorer 🚩
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                    Estado: Conectado ({anomalyData.length} Anomalías Encontradas)
                </p>
            </header>

            {/* Main Grid Layout for panels */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* 1. Summary Panel (Top Users Table) */}
                <div className="lg:col-span-1 bg-gray-800 p-6 rounded-lg shadow-xl h-fit">
                    <h2 className="text-2xl font-semibold mb-4 text-red-300">
                        Top 10 Usuarios: Gasto Agregado
                    </h2>
                    <p className="text-sm text-gray-400 mb-4">
                        *Simulación: Gasto Mensual Total y Ratio de Fraude Histórico.
                    </p>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-700">
                            <thead className="bg-gray-700">
                                <tr>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">ID Usuario</th>
                                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Gasto Total</th>
                                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Ratio Fraude</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {summaryData.slice(0, 10).map((user, index) => (
                                    <tr key={user.user_id} className={index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-750'}>
                                        <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-100">{user.user_id}</td>
                                        <td className="px-3 py-2 whitespace-nowrap text-sm text-right text-green-300">${user.total_monthly_spending.toFixed(2)}</td>
                                        <td className={`px-3 py-2 whitespace-nowrap text-sm text-right ${user.historical_fraud_ratio > 0 ? 'text-red-400 font-bold' : 'text-gray-400'}`}>
                                            {user.historical_fraud_ratio.toFixed(2)}%
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* 2. Visualization Panel */}
                <div className="lg:col-span-2 bg-gray-800 p-6 rounded-lg shadow-xl flex flex-col">
                    <h2 className="text-2xl font-semibold mb-4 text-red-300">
                        Distribución y Puntuación de Anomalías
                    </h2>
                    {/* Bar Chart Simulation */}
                    <div className="flex justify-around items-end h-64 bg-gray-700 p-4 rounded-md">
                        {chartData.datasets.map((data, index) => (
                            <div key={index} className="flex flex-col items-center h-full justify-end">
                                <div
                                    className={`w-16 rounded-t-lg transition-all duration-500`}
                                    style={{
                                        // Scale value to fit container (max 200px height)
                                        height: `${Math.min(data.value * 0.05, 200)}px`,
                                        backgroundColor: index === 0 ? '#4CAF50' : '#F44336' // Green for Normal, Red for Anomaly
                                    }}
                                ></div>
                                <span className="mt-2 text-sm text-gray-300 font-semibold">${data.value}</span>
                                <span className="text-xs text-gray-400 text-center max-w-[100px]">{data.label}</span>
                            </div>
                        ))}
                    </div>
                    <p className="mt-4 text-sm text-gray-400">
                        Visualización del monto promedio de las transacciones: Normal vs. Anómala (Flagged).
                    </p>
                </div>

                {/* 3. Anomaly List Panel */}
                <div className="lg:col-span-3 bg-gray-800 p-6 rounded-lg shadow-xl mt-4">
                    <h2 className="text-2xl font-semibold mb-4 text-red-300">
                        Lista de Transacciones Anómalas
                    </h2>
                    <p className="text-sm text-gray-400 mb-4">
                        Marcadas por Isolation Forest (Top {(ANOMALY_THRESHOLD * 100).toFixed(0)}% por Puntuación de Anomalía).
                    </p>
                    <div className="overflow-y-scroll h-96 border border-gray-700 rounded-md">
                        <table className="min-w-full divide-y divide-gray-700">
                            <thead className="sticky top-0 bg-gray-700 z-10">
                                <tr>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">ID</th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Usuario</th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Tipo</th>
                                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Monto</th>
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
                                        <td className="px-3 py-2 whitespace-nowrap text-sm text-right text-yellow-400">{txn.anomaly_score.toFixed(4)}</td>
                                        <td className="px-3 py-2 whitespace-nowrap text-xs text-right text-gray-500">{new Date(txn.timestamp).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {anomalyData.length === 0 && (
                            <div className="p-4 text-center text-gray-500">No se encontraron anomalías por encima del umbral actual.</div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default App;
