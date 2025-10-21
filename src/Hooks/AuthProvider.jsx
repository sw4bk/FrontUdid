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
    const handleLogoutEvent = () => {
      authService.logout();
      setIsAuthenticated(false);
    };
    window.addEventListener('tokenExpired', handleLogoutEvent);
  
    const init = async () => {
      setLoading(true);
    
      const refresh = localStorage.getItem('refreshToken');
      const access = localStorage.getItem('accessToken');
    
      // Caso 1: no hay access pero sí refresh → intenta renovar sin esperar un 401
      if (!access && refresh) {
        try {
          const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/refresh/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh }),
          });
          if (res.ok) {
            const { access } = await res.json();
            localStorage.setItem('accessToken', access);
            setIsAuthenticated(true);
          } else {
            await authService.logout();
            setIsAuthenticated(false);
          }
        } catch {
          await authService.logout();
          setIsAuthenticated(false);
        } finally {
          setLoading(false);
        }
        return;
      }
    
      // Caso 2: hay access (vigente o no) → deja que el interceptor maneje 401/refresh
      const hasAccessToken = !!access;
      setIsAuthenticated(hasAccessToken);
      setLoading(false);
    };
  
    init();
  
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