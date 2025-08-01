"use client";
import { useEffect, useState } from "react";
import { Bar, Line } from "react-chartjs-2";
import {
    Chart as ChartJS,
    BarElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend,
    LineElement,
    PointElement,
} from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, LineElement, PointElement);

export default function AdminAnalytics() {
    const [featureData, setFeatureData] = useState([]);
    const [userLoginData, setUserLoginData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                // Fetch feature usage data (your existing endpoint)
                const featureRes = await fetch("/api/admin/analytics");
                const featureResult = await featureRes.json();
                setFeatureData(featureResult);

                // Fetch user login data based on lastLogin field
                const loginRes = await fetch("/api/admin/user-activity");
                const loginResult = await loginRes.json();
                setUserLoginData(loginResult);
            } catch (error) {
                console.error('Error fetching analytics:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    // Feature Usage Chart
    const featureChartData = {
        labels: featureData.map((item) => item.feature),
        datasets: [
            {
                label: "Usage Count",
                data: featureData.map((item) => item.count),
                backgroundColor: [
                    "#3b82f6",
                    "#10b981",
                    "#f59e0b",
                    "#ef4444",
                    "#8b5cf6",
                    "#06b6d4",
                ],
                borderRadius: 4,
            },
        ],
    };

    // User Login Time Series Chart
    const loginChartData = {
        labels: userLoginData.map((item) => item.date),
        datasets: [
            {
                label: "Daily Active Users",
                data: userLoginData.map((item) => item.count),
                borderColor: "#3b82f6",
                backgroundColor: "rgba(59, 130, 246, 0.1)",
                tension: 0.3,
                fill: true,
                pointBackgroundColor: "#3b82f6",
                pointBorderWidth: 2,
                pointRadius: 4,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
        },
        scales: {
            y: {
                beginAtZero: true,
            },
        },
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="animate-pulse">
                        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                        <div className="h-64 bg-gray-200 rounded"></div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="animate-pulse">
                        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                        <div className="h-64 bg-gray-200 rounded"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Feature Usage Chart */}
            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Feature Usage Analytics</h3>
                <div className="h-80">
                    <Bar data={featureChartData} options={chartOptions} />
                </div>
            </div>

            {/* User Activity Chart */}
            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Daily Active Users</h3>
                <div className="h-80">
                    <Line data={loginChartData} options={chartOptions} />
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                    <h4 className="text-sm font-medium text-blue-600 uppercase tracking-wide">Total Feature Usage</h4>
                    <p className="text-3xl font-bold text-blue-900 mt-2">
                        {featureData.reduce((sum, item) => sum + item.count, 0)}
                    </p>
                </div>
                <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                    <h4 className="text-sm font-medium text-green-600 uppercase tracking-wide">Active Users Today</h4>
                    <p className="text-3xl font-bold text-green-900 mt-2">
                        {userLoginData[userLoginData.length - 1]?.count || 0}
                    </p>
                </div>
                <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
                    <h4 className="text-sm font-medium text-purple-600 uppercase tracking-wide">Most Used Feature</h4>
                    <p className="text-lg font-bold text-purple-900 mt-2">
                        {featureData.length > 0
                            ? featureData.reduce((prev, current) => (prev.count > current.count) ? prev : current).feature
                            : 'N/A'
                        }
                    </p>
                </div>
            </div>
        </div>
    );
}