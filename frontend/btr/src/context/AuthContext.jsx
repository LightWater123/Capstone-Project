import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// Create context for auth state
const AuthContext = createContext();

// Provider component: exposes {user, login, logout}
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const login = (userData) => setUser(userData); // save user
  const logout = () => setUser(null); // clear user
  axios.defaults.withCredentials = true;


    // Rehydrate user on page load
  useEffect(() => {
    axios.get('http://localhost:8000/sanctum/csrf-cookie', {
    withCredentials: true,
    }).then(() => {
      axios.get('http://localhost:8000/api/user', {
        withCredentials: true,
      })
      .then(res => {
        if (res.data) {
          setUser({ ...res.data, role: 'service' });
        }
      })
      .catch(() => {
        setUser(null);
      });
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// can be used in any component to get user info
export function useAuth() {
  return useContext(AuthContext);
}
