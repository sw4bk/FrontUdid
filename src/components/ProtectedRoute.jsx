import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../Hooks/AuthProvider';

const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Cargando...</div>; // O un spinner
  }
  
  // Si no está autenticado, redirige al login
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;