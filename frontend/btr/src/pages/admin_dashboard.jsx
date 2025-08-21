import { BrowserRouter, Routes, Route } from 'react-router'; 
import { useNavigate, Link } from 'react-router'; 
import { useState } from "react"; import '../index.css';

// AdminDashboard.jsx
export default function AdminDashboard() {

  const navigate = useNavigate();

  // call service_register.jsx
  const handleCreateServiceAccount = () => 
    {
      navigate('/service_register');
    }

    const inventoryList = () =>
      {
        navigate('/admin/inventory');
      }

  return (
    <>
      <div className="p-8">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      </div>

      <div className="container">
        <button
        onClick={handleCreateServiceAccount}
        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition">
          Create service user account
        </button>

      <div className="container">
        <button
        onClick={inventoryList} 
        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition">
            Preventive Maintenance
        </button>
      </div>
      </div>
    </>
  );
}