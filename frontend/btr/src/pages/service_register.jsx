import { BrowserRouter, Routes, Route } from 'react-router'; 
import { useNavigate, Link } from 'react-router'; 
import { useState } from "react"; 
import '../index.css';
import axios from '../api/axios.js';

// service_user registration
export default function ServiceRegister() 
{
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirm_password:'',
    mobile_number: '',
    address: '',
    service_type: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // service types from backend
  const serviceTypes = [
    { value: 'Vehicle', label: 'Vehicle' },
    { value: 'Appliances', label: 'Appliances' },
    { value: 'ICT Equipment', label: 'ICT Equipment' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // clear error when user starts typing
    if(errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const getCookie = (name) => {
    const cookies = document.cookie.split('; ');
    for (let cookie of cookies) {
      const [key, value] = cookie.trim().split('=');
      if (key === name) {
        return decodeURIComponent(value.trim());
      }
    }
    return null;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    if (formData.password !== formData.confirm_password) {
      setErrors(prev => ({
        ...prev,
        confirm_password: 'Passwords do not match.',
      }));
      setLoading(false);
      return;
    }

    try {
      await axios.get('/sanctum/csrf-cookie', { withCredentials: true });

      const token = getCookie('XSRF-TOKEN');
      if (!token) throw new Error('CSRF token not found');

      const response = await axios.post('/service/register', {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        mobile_number: formData.mobile_number,
        address: formData.address,
        service_type: formData.service_type,
      }, {
        headers: {
          'X-XSRF-TOKEN': token,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      });

      const user = response.data.user;
      if (user.role === 'service') {
        navigate('/service/dashboard');
      } else {
        navigate('/service/login');
      }
    } catch (err) {
      console.error('Registration error:', err.response?.data);
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        alert('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      <section className="w-full max-w-md bg-white p-8 rounded-xl shadow-md">
        <header className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-gray-800">Service User Registration</h1>
          <p className="text-gray-600 mt-2">Create your service account</p>
        </header>

        <form onSubmit={handleRegister} className="space-y-4">
          <FormInput
            label="Username"
            name="username"
            type="text"
            value={formData.username}
            onChange={handleChange}
            error={errors.username}
            disabled={loading}
          />
          
          <FormInput
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            disabled={loading}
          />
          
          <FormInput
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            disabled={loading}
          />
          
          <FormInput
            label="Confirm Password"
            name="confirm_password"
            type="password"
            value={formData.confirm_password}
            onChange={handleChange}
            error={errors.confirm_password}
            disabled={loading}
          />

          <FormInput
            label="Mobile Number"
            name="mobile_number"
            type="tel"
            value={formData.mobile_number}
            onChange={handleChange}
            error={errors.mobile_number}
            disabled={loading}
          />

          <FormTextarea
            label="Address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            error={errors.address}
            disabled={loading}
          />

          <FormSelect
            label="Service Type"
            name="service_type"
            value={formData.service_type}
            onChange={handleChange}
            error={errors.service_type}
            disabled={loading}
            options={serviceTypes}
          />

      

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 px-4 text-white rounded-md transition duration-200 ${
              loading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {loading ? 'Registering...' : 'Register Service User'}
          </button>
        </form>

        <footer className="mt-6 text-center text-sm">
          <Link 
            to="/login" 
            className="text-green-600 hover:underline"
          >
            Already have an account? Login
          </Link>
          <div className="mt-2">
            <Link 
              to="/admin_register" 
              className="text-blue-600 hover:underline"
            >
              Register as Admin
            </Link>
          </div>
        </footer>
      </section>
    </main>
  );
}

// form input component
function FormInput({ label, type, name, value, onChange, error, disabled = false }) {
  return (
    <div>
      <label htmlFor={name} className="block mb-1 font-medium text-gray-700">
        {label}
      </label>
      <input  
        id={name}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required
        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition duration-200 text-gray-900 ${
          error 
            ? 'border-red-500 focus:ring-red-500' 
            : 'border-gray-300 focus:ring-green-500'
        } ${
          disabled ? 'bg-gray-100 cursor-not-allowed' : ''
        }`}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}

// form textarea Component
function FormTextarea({ label, name, value, onChange, error, disabled = false }) {
  return (
    <div>
      <label htmlFor={name} className="block mb-1 font-medium text-gray-700">
        {label}
      </label>
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required
        rows="3"
        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition duration-200 resize-none text-gray-900 ${
          error 
            ? 'border-red-500 focus:ring-red-500' 
            : 'border-gray-300 focus:ring-green-500'
        } ${
          disabled ? 'bg-gray-100 cursor-not-allowed' : ''
        }`}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}

// form select Component
function FormSelect({ label, name, value, onChange, error, disabled = false, options = [] }) {
  return (
    <div>
      <label htmlFor={name} className="block mb-1 font-medium text-gray-700">
        {label}
      </label>
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required
        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition duration-200 text-gray-900 ${
          error 
            ? 'border-red-500 focus:ring-red-500' 
            : 'border-gray-300 focus:ring-green-500'
        } ${
          disabled ? 'bg-gray-100 cursor-not-allowed' : ''
        }`}
      >
        <option value="" className="text-gray-500">Select a service type</option>
        {options.map((option) => (
          <option key={option.value} value={option.value} className="text-gray-900">
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}