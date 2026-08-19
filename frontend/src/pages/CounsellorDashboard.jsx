import React, { useState, useEffect } from 'react';
import apiClient from '../services/api';

export default function CounsellorDashboard() {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQueue = async () => {
      try {
        const response = await apiClient.get('/assessments/queue');
        setQueue(response.data);
      } catch (error) {
        console.error("Failed to load triage queue", error);
      } finally {
        setLoading(false);
      }
    };
    fetchQueue();
  }, []);

  const getRiskColor = (riskLevel) => {
    switch(riskLevel) {
      case 'Critical_Crisis': return 'bg-red-600 text-white animate-pulse';
      case 'Severe': return 'bg-orange-500 text-white';
      case 'Moderately Severe': return 'bg-yellow-400 text-black';
      case 'Moderate': return 'bg-blue-300 text-black';
      default: return 'bg-green-200 text-black';
    }
  };

  if (loading) return <div className="p-10 text-center">Loading secure queue...</div>;

  return (
    <div className="max-w-5xl mx-auto p-6 mt-10">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Active Triage Queue</h2>
      
      <div className="overflow-x-auto shadow-md rounded-lg">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="py-3 px-4 text-left">Date Submitted</th>
              <th className="py-3 px-4 text-left">Student ID (Anonymized)</th>
              <th className="py-3 px-4 text-left">Score</th>
              <th className="py-3 px-4 text-left">Risk Level</th>
              <th className="py-3 px-4 text-left">Status</th>
              <th className="py-3 px-4 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {queue.map((caseItem) => (
              <tr key={caseItem.id} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4">{new Date(caseItem.created_at).toLocaleDateString()}</td>
                <td className="py-3 px-4 font-mono text-xs">{caseItem.id.split('-')[0]}***</td>
                <td className="py-3 px-4 font-bold">{caseItem.total_score}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${getRiskColor(caseItem.risk_level)}`}>
                    {caseItem.risk_level.replace('_', ' ')}
                  </span>
                </td>
                <td className="py-3 px-4">{caseItem.status.replace('_', ' ')}</td>
                <td className="py-3 px-4">
                  <button className="bg-indigo-600 text-white px-3 py-1 rounded text-sm hover:bg-indigo-700">
                    Open Case
                  </button>
                </td>
              </tr>
            ))}
            {queue.length === 0 && (
              <tr><td colSpan="6" className="py-6 text-center text-gray-500">No active cases in queue.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}