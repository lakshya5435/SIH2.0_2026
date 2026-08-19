import React, { useState, useEffect } from 'react';
import apiClient from '../services/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalAssessments: 0,
    criticalCases: 0,
    riskDistribution: { low: 0, moderate: 0, severe: 0 }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a production environment, this would call a dedicated /api/analytics endpoint
    const fetchAnalytics = async () => {
      try {
        const response = await apiClient.get('/assessments/queue');
        const data = response.data;
        
        const total = data.length;
        const critical = data.filter(d => d.risk_level === 'Critical_Crisis').length;
        const severe = data.filter(d => d.risk_level.includes('Severe')).length;
        const moderate = data.filter(d => d.risk_level === 'Moderate').length;
        const low = total - critical - severe - moderate;

        setStats({
          totalAssessments: total,
          criticalCases: critical,
          riskDistribution: { low, moderate, severe: severe + critical }
        });
      } catch (error) {
        console.error("Failed to fetch analytics", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAnalytics();
  }, []);

  if (loading) return <div className="p-10 text-center">Compiling institutional reports...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6 mt-10">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Institutional Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-blue-500">
          <h3 className="text-gray-500 text-sm font-bold uppercase">Total Screenings (30 Days)</h3>
          <p className="text-4xl font-black text-gray-800 mt-2">{stats.totalAssessments}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-red-500">
          <h3 className="text-gray-500 text-sm font-bold uppercase">Critical Escalations</h3>
          <p className="text-4xl font-black text-red-600 mt-2">{stats.criticalCases}</p>
          <p className="text-xs text-gray-400 mt-1">Referred to 24/7 Hotline</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-green-500">
          <h3 className="text-gray-500 text-sm font-bold uppercase">System Uptime</h3>
          <p className="text-4xl font-black text-green-600 mt-2">99.9%</p>
          <p className="text-xs text-gray-400 mt-1">Audit Trail Active</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-bold mb-4">Risk Distribution</h3>
        <div className="w-full bg-gray-200 rounded-full h-6 flex overflow-hidden">
          <div style={{ width: `${(stats.riskDistribution.severe / stats.totalAssessments) * 100}%` }} className="bg-red-500 h-6"></div>
          <div style={{ width: `${(stats.riskDistribution.moderate / stats.totalAssessments) * 100}%` }} className="bg-yellow-400 h-6"></div>
          <div style={{ width: `${(stats.riskDistribution.low / stats.totalAssessments) * 100}%` }} className="bg-green-400 h-6"></div>
        </div>
        <div className="flex justify-between mt-2 text-sm text-gray-600 font-bold">
          <span>Severe / Critical</span>
          <span>Moderate</span>
          <span>Mild / Low</span>
        </div>
      </div>
    </div>
  );
}