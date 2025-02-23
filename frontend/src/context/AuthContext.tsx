import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  token: string;
  isGuest: boolean;
}

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  guestLogin: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/authRoutes/login`,
        {
          email,
          password,
        }
      );
      const userData = response.data;
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));


    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred during login');
      throw err;
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      setError(null);
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/authRoutes/register`, {
        name,
        email,
        password,
      });
      const userData = response.data;
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred during registration');
      throw err;
    }
  };

  const guestLogin = async () => {
    try {
      setError(null);
      setIsLoading(true);

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/authRoutes/guest-login`,
        {},
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const userData = response.data;

      if (!userData || !userData.token) {
        throw new Error('Invalid guest login response');
      }

      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));

    } catch (err: any) {
      console.error('Guest login error:', err);
      setError(err.response?.data?.message || 'Failed to login as guest');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, register, logout, guestLogin, isLoading, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 