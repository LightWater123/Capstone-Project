import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// ✅ Create a single shared context
export const AuthContext = createContext();

// ✅ Provider component: exposes { user, login, logout, loading }
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);       // Stores logged-in user
  const [loading, setLoading] = useState(true); // Tracks loading state

  const login = (userData) => setUser(userData); // Manual login
  const logout = () => setUser(null);            // Manual logout

  axios.defaults.withCredentials = true;         // Always send cookies

  useEffect(() => {
    // Step 1: Hydrate CSRF cookie for Laravel Sanctum
    axios.get('http://localhost:8000/sanctum/csrf-cookie')
      .then(() => {
        // Step 2: Fetch current user from Laravel session
        return axios.get('http://localhost:8000/api/user');
      })
      .then(res => {
        if (res.data?.user) {
          // Step 3: Set user with dynamic role from backend
          setUser({ ...res.data.user, role: res.data.role });
        } else {
          setUser(null);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('AuthProvider failed to fetch user:', err);
        setUser(null);
        setLoading(false);
      });
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

// ✅ Hook to access auth context from any component
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
