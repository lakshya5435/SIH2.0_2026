import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import StudentPortal from './pages/StudentPortal';
import CounsellorDashboard from './pages/CounsellorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login'; // Assuming a standard login component exists

// Protected Route Wrapper
const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <div className="p-10 text-center text-red-600 font-bold">Access Denied: Insufficient Permissions</div>;
  }

  return children;
};

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100 font-sans text-gray-900">
        <header className="bg-blue-900 text-white p-4 shadow-md flex justify-between items-center">
          <h1 className="text-xl font-bold">Digital Mental Health Support System</h1>
          {localStorage.getItem('token') && (
            <button 
              onClick={() => { localStorage.clear(); window.location.href='/login'; }}
              className="text-sm bg-blue-700 px-3 py-1 rounded hover:bg-blue-600"
            >
              Logout
            </button>
          )}
        </header>

        <main className="p-4">
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route 
              path="/student" 
              element={<ProtectedRoute allowedRoles={['student']}><StudentPortal /></ProtectedRoute>} 
            />
            
            <Route 
              path="/counsellor" 
              element={<ProtectedRoute allowedRoles={['counsellor', 'admin']}><CounsellorDashboard /></ProtectedRoute>} 
            />
            
            <Route 
              path="/admin" 
              element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} 
            />

            {/* Default redirect based on role, or login if none */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}