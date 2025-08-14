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

createRoot(document.getElementById('root')).render(

  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/login" element={<Login/>}/>
      <Route path="/admin_register" element={<Admin_register/>}/>
      <Route path="/service_register" element={<Service_register/>}/>
      <Route path="/admin/dashboard" element={<Admin/>}/>
      <Route path="/service/dashboard" element={<Service/>}/>
      <Route path="/admin/inventory" element={<InventoryDashboard/>}/>
    </Routes>
  </BrowserRouter>,

)
