// axios.js — centralized API configuration
import axios from 'axios';

export default axios.create({
  baseURL: 'http://localhost:8000', // Laravel backend
  withCredentials: true,            // Send cookies with requests
});
