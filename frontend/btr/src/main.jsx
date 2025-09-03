import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import Login from './pages/login.jsx';
import Admin_register from './pages/admin_register.jsx'
import Service_register from './pages/service_register.jsx';
import Admin from './pages/admin_dashboard.jsx';
import Service from './pages/service_dashboard.jsx';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import InventoryDashboard from './pages/inventory.jsx';
import DirectorDashboard from './pages/director_dashboard.jsx';
import ServiceMessages from './pages/service_messages.jsx';
import { AuthProvider } from './context/AuthProvider';

createRoot(document.getElementById('root')).render(

  
    <AuthProvider>
      <BrowserRouter>
          <Routes>
          <Route path="/" element={<App />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin_register" element={<Admin_register />} />
          <Route path="/service_register" element={<Service_register />} />
          <Route path="/service/messages" element={<ServiceMessages />} />
          <Route path="/admin/dashboard" element={<Admin />} />
          <Route path="/service/dashboard" element={<Service />} />
          <Route path="/admin/inventory" element={<InventoryDashboard />} />
          <Route path="/director/dashboard" element={<DirectorDashboard />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>

)
