
import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'member';
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (userData: { username: string; email: string; password: string; role?: 'admin' | 'member' }) => Promise<boolean>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing token
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Simulate API call - In real app, this would be an actual API call
      console.log('Login attempt:', { email });
      
      // Demo users for testing
      const demoUsers = [
        { id: '1', username: 'admin', email: 'admin@qa.com', password: 'admin123', role: 'admin' as const },
        { id: '2', username: 'tester', email: 'tester@qa.com', password: 'test123', role: 'member' as const }
      ];
      
      const foundUser = demoUsers.find(u => u.email === email && u.password === password);
      
      if (foundUser) {
        const { password: _, ...userWithoutPassword } = foundUser;
        setUser(userWithoutPassword);
        localStorage.setItem('authToken', 'demo-token-' + foundUser.id);
        localStorage.setItem('userData', JSON.stringify(userWithoutPassword));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
  };

  const register = async (userData: { username: string; email: string; password: string; role?: 'admin' | 'member' }): Promise<boolean> => {
    try {
      // Simulate API call
      console.log('Register attempt:', userData);
      
      // In real app, this would hash password and save to database
      const newUser: User = {
        id: Date.now().toString(),
        username: userData.username,
        email: userData.email,
        role: userData.role || 'member'
      };
      
      setUser(newUser);
      localStorage.setItem('authToken', 'demo-token-' + newUser.id);
      localStorage.setItem('userData', JSON.stringify(newUser));
      return true;
    } catch (error) {
      console.error('Register error:', error);
      return false;
    }
  };

  const value = {
    user,
    login,
    logout,
    register,
    isLoading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
