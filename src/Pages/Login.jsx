import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {TextField, Button, Typography, Alert,CircularProgress, Box, Paper, Tabs, Tab} from '@mui/material';
import LoginIcon from '@mui/icons-material/Login';
import AppRegistrationIcon from '@mui/icons-material/AppRegistration';

import { useAuth } from '../Hooks/AuthProvider.jsx';
import { useNotifications } from '../Hooks/NotificationProvider.jsx';

import '../styles/Login.scss';

const Login = () => {
  const navigate = useNavigate();
  const { login, register, loading, error } = useAuth(); 
  const { showSuccess, showError, showWarning } = useNotifications();
  const [tab, setTab] = useState(0); // 0: Login, 1: Registro
  const [form, setForm] = useState({ username: '', password: '' });
  const [registerForm, setRegisterForm] = useState({
    username: '', password: '', email: '',
    operador: '', documento: '', first_name: '', last_name: ''
  });
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e, isRegister = false) => {
    const { name, value } = e.target;
    const setter = isRegister ? setRegisterForm : setForm;
    setter(prev => ({ ...prev, [name]: value }));
    
    // Limpiar mensajes de éxito al cambiar campos
    setSuccessMessage('');
  };

  const handleSubmitLogin = async e => {
    e.preventDefault();
    const { username, password } = form;
    
    if (!username.trim() || !password.trim()) {
      showWarning('Por favor, completa todos los campos');
      return;
    }

    try {
      await login({ username, password });
      showSuccess(`¡Bienvenido, ${username}!`);
      navigate('/dashboard');
    } catch (err) {
      // El error se maneja por useAuth y se muestra en la UI
      console.error('Login fallido:', err);
    }
  };

  const handleSubmitRegister = async e => {
    e.preventDefault();
    const { username, password, email, operador, documento, first_name, last_name } = registerForm;
    
    if (!username.trim() || !password.trim() || !email.trim() || 
        !operador.trim() || !documento.trim() || !first_name.trim() || !last_name.trim()) {
      showWarning('Por favor, completa todos los campos del formulario');
      return;
    }

    // Validación básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showError('Por favor, ingresa un email válido');
      return;
    }

    // Validación básica de contraseña
    if (password.length < 6) {
      showError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      await register({
        username,
        password,
        email,
        operador,
        documento,
        first_name,
        last_name
      });

      // Si el registro es exitoso, el contexto no lanza un error, por lo que el código continúa
      setTab(0);
      setRegisterForm({ 
        username: '', password: '', email: '', 
        operador: '', documento: '', first_name: '', last_name: '' 
      });
      showSuccess('¡Registro exitoso! Ahora puedes iniciar sesión.');
    } catch (err) {
      console.error('Registro fallido:', err);
    }
  };

  const handleTabChange = (_, newValue) => {
    setTab(newValue);
    setSuccessMessage('');
    // Al cambiar de pestaña, limpiamos los errores del contexto
    // Esto requeriría una función setError(null) en el contexto
  };

  return (
    <Box className="login-wrapper">
      <Paper elevation={6} className="login-paper">
        <Tabs value={tab} onChange={handleTabChange} centered>
          <Tab label="Iniciar sesión" icon={<LoginIcon />} iconPosition="start" />
          <Tab label="Registrarse" icon={<AppRegistrationIcon />} iconPosition="start" />
        </Tabs>

        {/* Mensaje de éxito global */}
        {successMessage && (
          <Alert severity="success" className="success-alert" sx={{ mt: 2 }}>
            {successMessage}
          </Alert>
        )}

        {/* Mensaje de error del contexto de autenticación */}
        {error && (
          <Alert severity="error" className="error-alert" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        {tab === 0 && (
          <form onSubmit={handleSubmitLogin}>
            <Box className="login-header">
              <Typography variant="h5">Iniciar sesión</Typography>
              <Typography variant="body2" className="subtitle">Ingresa tus credenciales</Typography>
            </Box>

            <TextField
              name="username"
              label="Usuario"
              fullWidth
              variant="outlined"
              value={form.username}
              onChange={handleChange}
              margin="normal"
              disabled={loading}
            />
            <TextField
              name="password"
              label="Contraseña"
              type="password"
              fullWidth
              variant="outlined"
              value={form.password}
              onChange={handleChange}
              margin="normal"
              disabled={loading}
            />

            <Box className="button-wrapper">
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                disabled={loading || !form.username || !form.password}
                startIcon={loading && <CircularProgress size={20} />}
              >
                {loading ? 'Ingresando...' : 'Ingresar'}
              </Button>
            </Box>
          </form>
        )}

        {tab === 1 && (
          <form onSubmit={handleSubmitRegister}>
            <Box className="login-header">
              <Typography variant="h5">Registro</Typography>
              <Typography variant="body2" className="subtitle">Crea una cuenta nueva</Typography>
            </Box>

            <Box display="grid" gridTemplateColumns="repeat(2, 1fr)" gap={2}>
              <Box>
                <TextField
                  name="username"
                  label="Usuario"
                  fullWidth
                  variant="outlined"
                  value={registerForm.username}
                  onChange={e => handleChange(e, true)}
                  margin="normal"
                />
                <TextField
                  name="email"
                  label="Email"
                  type="email"
                  fullWidth
                  variant="outlined"
                  value={registerForm.email}
                  onChange={e => handleChange(e, true)}
                  margin="normal"
                />
                <TextField
                  name="password"
                  label="Contraseña"
                  type="password"
                  fullWidth
                  variant="outlined"
                  value={registerForm.password}
                  onChange={e => handleChange(e, true)}
                  margin="normal"
                />
                <TextField
                  name="operador"
                  label="Operador"
                  fullWidth
                  variant="outlined"
                  value={registerForm.operador}
                  onChange={e => handleChange(e, true)}
                  margin="normal"
                />
              </Box>

              <Box>
                <TextField
                  name="first_name"
                  label="Nombre"
                  fullWidth
                  variant="outlined"
                  value={registerForm.first_name}
                  onChange={e => handleChange(e, true)}
                  margin="normal"
                />
                <TextField
                  name="last_name"
                  label="Apellido"
                  fullWidth
                  variant="outlined"
                  value={registerForm.last_name}
                  onChange={e => handleChange(e, true)}
                  margin="normal"
                />
                <TextField
                  name="documento"
                  label="Legajo"
                  type="number"
                  fullWidth
                  variant="outlined"
                  value={registerForm.documento}
                  onChange={e => handleChange(e, true)}
                  margin="normal"
                />
              </Box>
            </Box>

            <Box className="button-wrapper">
              <Button
                type="submit"
                variant="contained"
                color="secondary"
                fullWidth
                disabled={
                  loading ||
                  !registerForm.username || !registerForm.password || !registerForm.email ||
                  !registerForm.operador || !registerForm.documento ||
                  !registerForm.first_name || !registerForm.last_name
                }
                startIcon={loading && <CircularProgress size={20} />}
              >
                {loading ? 'Registrando...' : 'Registrarse'}
              </Button>
            </Box>
          </form>
        )}
      </Paper>
    </Box>
  );
};

export default Login;
