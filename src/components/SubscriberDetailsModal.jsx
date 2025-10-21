import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Grid,
  Chip,
  Divider,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Avatar
} from '@mui/material';
import {
  Close as CloseIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Business as BusinessIcon,
  AppRegistration as AppIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Info as InfoIcon,
  Email as EmailIcon,
  CalendarToday as CalendarIcon,
  Computer as ComputerIcon,
  Security as SecurityIcon
} from '@mui/icons-material';

const SubscriberDetailsModal = ({ open, onClose, subscriber }) => {
  if (!subscriber) return null;

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'activo':
        return 'success';
      case 'inactive':
      case 'inactivo':
        return 'default';
      case 'pending':
      case 'pendiente':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getActivationIcon = (activated) => {
    return activated ? <CheckIcon color="success" /> : <CancelIcon color="error" />;
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 'var(--border-radius-lg)',
          boxShadow: 'var(--shadow-2xl)'
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        pb: 1
      }}>
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar sx={{ bgcolor: 'var(--color-primary)' }}>
            <PersonIcon />
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight="var(--font-weight-semibold)">
              {subscriber.first_name} {subscriber.last_name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              SN: {subscriber.sn}
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={3}>
          {/* Información Personal */}
          <Grid item xs={12} md={6}>
            <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
              <Typography variant="h6" gutterBottom display="flex" alignItems="center" gap={1}>
                <PersonIcon color="primary" />
                Información Personal
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <BusinessIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Subscriber Code"
                    secondary={subscriber.subscriber_code}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <EmailIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Email"
                    secondary={subscriber.email || 'No disponible'}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <PhoneIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="SN (Serial Number)"
                    secondary={subscriber.sn}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    {getActivationIcon(subscriber.activated)}
                  </ListItemIcon>
                  <ListItemText 
                    primary="Estado"
                    secondary={
                      <Chip 
                        label={subscriber.activated ? 'Activo' : 'Inactivo'} 
                        color={subscriber.activated ? 'success' : 'default'}
                        size="small"
                      />
                    }
                  />
                </ListItem>
              </List>
            </Paper>
          </Grid>

          {/* Información de UDID */}
          <Grid item xs={12} md={6}>
            <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
              <Typography variant="h6" gutterBottom display="flex" alignItems="center" gap={1}>
                <AppIcon color="primary" />
                Información de UDID
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <AppIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="UDID"
                    secondary={
                      subscriber.udid ? (
                        <Typography 
                          variant="body2" 
                          fontFamily="var(--font-family-mono)"
                          sx={{ 
                            backgroundColor: 'var(--color-gray-100)',
                            padding: '4px 8px',
                            borderRadius: 'var(--border-radius-sm)',
                            wordBreak: 'break-all'
                          }}
                        >
                          {subscriber.udid}
                        </Typography>
                      ) : (
                        'No asociado'
                      )
                    }
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <SecurityIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Estado UDID"
                    secondary={
                      subscriber.udid_status ? (
                        <Chip 
                          label={subscriber.udid_status}
                          color={getStatusColor(subscriber.udid_status)}
                          size="small"
                        />
                      ) : (
                        'Sin estado'
                      )
                    }
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <BusinessIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Operador"
                    secondary={subscriber.validated_by_operator || 'No asignado'}
                  />
                </ListItem>
              </List>
            </Paper>
          </Grid>

          {/* Información de App */}
          <Grid item xs={12} md={6}>
            <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
              <Typography variant="h6" gutterBottom display="flex" alignItems="center" gap={1}>
                <ComputerIcon color="primary" />
                Información de App
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <AppIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Tipo de App"
                    secondary={subscriber.app_type || 'No disponible'}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <InfoIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Versión"
                    secondary={subscriber.app_version || 'No disponible'}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <BusinessIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Packages"
                    secondary={subscriber.packageNames?.join(', ') || 'Ninguno'}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <BusinessIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Products"
                    secondary={subscriber.products?.join(', ') || 'Ninguno'}
                  />
                </ListItem>
              </List>
            </Paper>
          </Grid>

          {/* Información de Sistema */}
          <Grid item xs={12} md={6}>
            <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
              <Typography variant="h6" gutterBottom display="flex" alignItems="center" gap={1}>
                <CalendarIcon color="primary" />
                Información de Sistema
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <CalendarIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Última Activación"
                    secondary={subscriber.lastActivation || 'No disponible'}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CalendarIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Fecha de Registro"
                    secondary={subscriber.created_at || 'No disponible'}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <ComputerIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Dispositivo"
                    secondary={subscriber.device_type || 'No disponible'}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <SecurityIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="IP Última Conexión"
                    secondary={subscriber.last_ip || 'No disponible'}
                  />
                </ListItem>
              </List>
            </Paper>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="outlined">
          Cerrar
        </Button>
        <Button 
          variant="contained" 
          color="primary"
          onClick={() => {
            // Aquí podrías agregar funcionalidad adicional
            console.log('Acción adicional para:', subscriber.sn);
          }}
        >
          Acción Adicional
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SubscriberDetailsModal;
