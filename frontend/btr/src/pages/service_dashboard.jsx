import { BrowserRouter, Routes, Route, useNavigate, Link } from 'react-router'; 
import { useState } from "react"; import '../index.css';


// ServiceDashboard.jsx
export default function ServiceDashboard() {

  const navigate = useNavigate();

  const viewMessages = () =>
    {
      navigate('/service/messages');
    }

  return (
    <>
      <div className="p-8">
      <h1 className="text-2xl font-bold">Service Dashboard</h1>
    </div>

    <div className="container">
      <button onClick={viewMessages}>
        Messages
      </button>
    </div>
    </>
    
  );
}
