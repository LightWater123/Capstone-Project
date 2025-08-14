  import { BrowserRouter, Routes, Route, useNavigate, Link } from 'react-router-dom';
  import { useState } from "react"; 
  import '../index.css';
  import axios from '../api/axios.js';

  export default function Register() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
      username: '',
      email: '',
      password: '',
      mobile_number:'',
      confirm_password:'',
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
      // clear error when user starts typing
      if(errors[name]) {
        setErrors((prev) => ({ ...prev, [name]: '' }));
      }
    };

    const handleRegister = async(e) => {
      e.preventDefault();
      setErrors({}); // clears previous errors
      setLoading(true); // indicates to the user that something is running

      // confirm password before sending registration request
        if(formData.password !== formData.confirm_password)
          {
            setErrors(prev => ({
              ...prev,
              confirm_password: 'Passwords do not match.',
            }));
            setLoading(false);
            return;
          }
      
    // helper function to get CSRF token from cookies
    function getCookie(name) 
    {
      const cookies = document.cookie.split('; ');
      for (let cookie of cookies) 
        {
        const [key, value] = cookie.trim().split('=');
        if (key === name) 
          {
            return decodeURIComponent(value.trim());
          } 
        }
        return null; // return null if cookie not found
    }
      try {
        // get CSRF cookie from Sanctum
        await axios.get('/sanctum/csrf-cookie', {
          withCredentials: true, // include cookies in the request
        });

        // get CSRF token from cookie
        const token = getCookie('XSRF-TOKEN');
        console.log('CSRF Token:', token); // Debug log
        // if token not found, throw an error
        if (!token) {
          throw new Error('CSRF token not found in cookies');
        }

        // send admin registration request to the correct endpoint route::post
        const response = await axios.post(
          'admin/register',
          {
            username: formData.username,
            email: formData.email,
            password: formData.password,
            mobile_number: formData.mobile_number,
            //_token: token, // include CSRF token in the request body DONT REMOVE LINE
          },
          {
            headers: {
              'X-XSRF-TOKEN': token, 
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
            withCredentials: true, // include cookies in the request
          }
        );

        // extract user from response
        const user = response.data.user;

        // redirect based on user role
        if(user.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/admin/login');
        }
      } 
      catch(err) {
        console.error('Registration error:', err.response?.data); // error log
        
        // handle validation errors
        if (err.response?.data?.errors) {
          setErrors(err.response.data.errors);
        } else {
          // error message
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
            <h1 className="text-3xl font-bold text-gray-800">Admin Registration</h1>
            <p className="text-gray-600 mt-2">Create your admin account</p>
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

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 px-4 text-white rounded-md transition duration-200 ${
                loading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {loading ? 'Registering...' : 'Register Admin'}
            </button>
          </form>

          <footer className="mt-6 text-center text-sm">
            <Link 
              to="/login" 
              className="text-blue-600 hover:underline"
            >
              Already have an account? Login
            </Link>
            <div className="mt-2">
              <Link 
                to="/service_register" 
                className="text-green-600 hover:underline"
              >
                Register as Service User
              </Link>
            </div>
          </footer>
        </section>
      </main>
    );
  }

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
              : 'border-gray-300 focus:ring-blue-500'
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
  