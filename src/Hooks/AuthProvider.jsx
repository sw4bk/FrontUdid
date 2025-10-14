import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from './authService';

// 1. Crea el contexto
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 2. Efecto para inicializar el estado al cargar la app
  useEffect(() => {
    // Escucha el evento de expiración del token que disparaste en apiService
    const handleLogoutEvent = () => {
      authService.logout();
      setIsAuthenticated(false);
    };
    window.addEventListener('tokenExpired', handleLogoutEvent);

    const checkAuthStatus = () => {
      setIsAuthenticated(authService.isAuthenticated());
      setLoading(false);
    };
    checkAuthStatus();

    return () => {
      window.removeEventListener('tokenExpired', handleLogoutEvent);
    };
  }, []);

  // 3. Funciones que usarán tu servicio
  const login = async (credentials) => {
    setLoading(true);
    setError(null);
    try {
      await authService.login(credentials);
      setIsAuthenticated(true);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Error de credenciales');
      setLoading(false);
      throw err; // Re-lanza el error para que el componente Login lo pueda manejar
    }
  };

  const logout = async () => {
    await authService.logout();
    setIsAuthenticated(false);
  };

  const register = async (userData) => { // Función de registro agregada
    setLoading(true);
    setError(null);
    try {
      const response = await authService.register(userData);
      setLoading(false);
      return response;
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Error en el registro');
      setLoading(false);
      throw err;
    }
  };

  // 4. El valor que proveerá el contexto
  const value = {
    isAuthenticated,
    loading,
    error,
    login,
    logout,
    register,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 5. El hook personalizado para usar el contexto fácilmente
export const useAuth = () => {
  return useContext(AuthContext);
};