import { createContext, useContext, useState, useCallback } from 'react';
import { Snackbar, Alert, Slide } from '@mui/material';
import '../styles/Notifications.scss';

// 1. Crear el contexto
const NotificationContext = createContext(null);

// 2. Componente de transición para las notificaciones
function SlideTransition(props) {
  return <Slide {...props} direction="up" />;
}

// 3. Provider del contexto
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  // Función para agregar una nueva notificación
  const addNotification = useCallback((notification) => {
    const id = Date.now() + Math.random();
    const newNotification = {
      id,
      type: 'info', // default
      duration: 4000, // 4 segundos por defecto
      ...notification,
    };

    setNotifications(prev => [...prev, newNotification]);

    // Auto-remover después de la duración especificada
    setTimeout(() => {
      removeNotification(id);
    }, newNotification.duration);

    return id;
  }, []);

  // Función para remover una notificación
  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  // Funciones de conveniencia para diferentes tipos
  const showSuccess = useCallback((message, options = {}) => {
    return addNotification({
      type: 'success',
      message,
      duration: 3000,
      ...options,
    });
  }, [addNotification]);

  const showError = useCallback((message, options = {}) => {
    return addNotification({
      type: 'error',
      message,
      duration: 6000, // Errores se muestran más tiempo
      ...options,
    });
  }, [addNotification]);

  const showWarning = useCallback((message, options = {}) => {
    return addNotification({
      type: 'warning',
      message,
      duration: 4000,
      ...options,
    });
  }, [addNotification]);

  const showInfo = useCallback((message, options = {}) => {
    return addNotification({
      type: 'info',
      message,
      duration: 4000,
      ...options,
    });
  }, [addNotification]);

  // Función para limpiar todas las notificaciones
  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  // Valor del contexto
  const value = {
    notifications,
    addNotification,
    removeNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    clearAll,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      
      {/* Renderizar todas las notificaciones */}
      {notifications.map((notification, index) => (
        <Snackbar
          key={notification.id}
          open={true}
          autoHideDuration={notification.duration}
          onClose={() => removeNotification(notification.id)}
          TransitionComponent={SlideTransition}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          sx={{
            marginBottom: `${index * 70}px`, // Apilar notificaciones
            zIndex: 9999,
          }}
        >
          <Alert
            onClose={() => removeNotification(notification.id)}
            severity={notification.type}
            variant="filled"
            sx={{
              minWidth: '300px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              '& .MuiAlert-message': {
                fontSize: '14px',
                fontWeight: 500,
              },
            }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      ))}
    </NotificationContext.Provider>
  );
};

// 4. Hook personalizado para usar las notificaciones
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications debe ser usado dentro de NotificationProvider');
  }
  return context;
};
