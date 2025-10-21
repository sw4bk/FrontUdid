import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../Hooks/AuthProvider';

const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '16px',
        color: 'var(--color-gray-600)'
      }}>
        Verificando autenticación...
      </div>
    );
  }
  
  // Si no está autenticado, redirige al login
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;