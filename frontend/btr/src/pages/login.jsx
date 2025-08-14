// src/pages/login.jsx
import { useState } from "react";
import axios from "axios";
import Cookie from "js-cookie";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

axios.defaults.withCredentials = true;

const handleLogin = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError("");

  try {
    // Get CSRF cookie
    await axios.get("http://localhost:8000/sanctum/csrf-cookie", {
      withCredentials: true
    });

    // Get XSRF token from cookies
    const xsrfToken = Cookie.get("XSRF-TOKEN");
    axios.defaults.headers.common["X-XSRF-TOKEN"] = xsrfToken;

    // Send login request
    const response = await axios.post(
      "http://localhost:8000/admin/login",
      { username, password },
      { withCredentials: true }
    );

    console.log("Login successful:", response.data);

    // Redirect based on user role
    if (response.data.user.role === "admin") {
     navigate("/admin/dashboard");
    } else {
      navigate("/service/dashboard");
    }

    console.log("Role: ", response.data.user.role);
    
  } catch (err) {
    console.error("Login error:", err.response?.data || err.message);
    setError(
      err.response?.data?.message || "Login failed. Please try again."
    );
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleLogin}
        className="bg-white p-6 rounded shadow-md w-80"
      >
        <h1 className="text-2xl font-bold mb-4 text-black">Admin Login</h1>

        {error && <p className="text-red-500 mb-3">{error}</p>}

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="border p-2 w-full mb-3 rounded text-black"
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 w-full mb-4 rounded text-black"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded w-full"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}
