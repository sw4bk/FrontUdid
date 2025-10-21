import React, { memo } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Chip,
  Box,
  Button,
  TextField,
  Tooltip,
  Divider,
  Grid,
  Avatar
} from '@mui/material';
import {
  Person as PersonIcon,
  Phone as PhoneIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Info as InfoIcon,
  Business as BusinessIcon,
  AppRegistration as AppIcon
} from '@mui/icons-material';

const SubscriberCard = memo(({ 
  item, 
  udidEdits, 
  opEdits, 
  onUdidChange, 
  onOpChange, 
  onSaveUdid, 
  onDisassociateUdid, 
  postLoading 
}) => {
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
    <Card 
      elevation={2} 
      sx={{ 
        mb: 3, 
        transition: 'box-shadow 0.2s ease',
        '&:hover': {
          elevation: 3,
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }
      }}
      className="corporate-card"
    >
      <CardHeader
        avatar={
          <Avatar sx={{ bgcolor: 'var(--color-primary)' }}>
            <PersonIcon />
          </Avatar>
        }
        title={
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="h6" fontWeight="var(--font-weight-semibold)">
              {item.first_name} {item.last_name}
            </Typography>
            {getActivationIcon(item.activated)}
          </Box>
        }
        subheader={
          <Box display="flex" alignItems="center" gap={2} mt={1}>
            <Chip 
              label={item.activated ? 'Activo' : 'Inactivo'} 
              color={item.activated ? 'success' : 'default'}
              size="small"
              className={item.activated ? 'status-active' : 'status-inactive'}
            />
            <Typography variant="body2" color="text.secondary">
              SN: {item.sn}
            </Typography>
          </Box>
        }
        action={
          <Tooltip title="Ver detalles">
            <Button size="small" variant="outlined">
              <InfoIcon />
            </Button>
          </Tooltip>
        }
      />
      
      <CardContent>
        <Grid container spacing={3}>
          {/* Información Principal */}
          <Grid item xs={12} md={6}>
            <Box mb={2}>
              <Typography variant="body2" color="text.secondary" gutterBottom display="flex" alignItems="center" gap={1}>
                <BusinessIcon fontSize="small" />
                Subscriber Code
              </Typography>
              <Typography variant="body1" fontWeight="var(--font-weight-medium)" fontFamily="var(--font-family-mono)">
                {item.subscriber_code}
              </Typography>
            </Box>

            <Box mb={2}>
              <Typography variant="body2" color="text.secondary" gutterBottom display="flex" alignItems="center" gap={1}>
                <PhoneIcon fontSize="small" />
                Operador
              </Typography>
              {item.validated_by_operator ? (
                <Chip 
                  label={item.validated_by_operator} 
                  color="primary" 
                  size="small"
                  icon={<BusinessIcon />}
                />
              ) : (
                <TextField
                  size="small"
                  variant="outlined"
                  value={opEdits[item.sn] || ''}
                  placeholder="Ingresar operador"
                  onChange={(e) => onOpChange(item.sn, e.target.value)}
                  sx={{ width: '100%' }}
                />
              )}
            </Box>
          </Grid>

          {/* UDID Section */}
          <Grid item xs={12} md={6}>
            <Box mb={2}>
              <Typography variant="body2" color="text.secondary" gutterBottom display="flex" alignItems="center" gap={1}>
                <AppIcon fontSize="small" />
                UDID
              </Typography>
              {item.udid ? (
                <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                  <Typography 
                    variant="body1" 
                    fontFamily="var(--font-family-mono)"
                    sx={{ 
                      backgroundColor: 'var(--color-gray-100)',
                      padding: '4px 8px',
                      borderRadius: 'var(--border-radius-sm)',
                      fontSize: 'var(--font-size-sm)',
                      wordBreak: 'break-all'
                    }}
                  >
                    {item.udid}
                  </Typography>
                  {item.udid_status && (
                    <Chip 
                      label={item.udid_status} 
                      color={getStatusColor(item.udid_status)}
                      size="small"
                      className={item.udid_status === 'active' ? 'status-active' : 'status-pending'}
                    />
                  )}
                </Box>
              ) : (
                <TextField
                  size="small"
                  variant="outlined"
                  value={udidEdits[item.sn] || ''}
                  placeholder="Ingresar UDID"
                  onChange={(e) => onUdidChange(item.sn, e.target.value)}
                  sx={{ width: '100%' }}
                />
              )}
            </Box>
          </Grid>

          {/* Información Adicional */}
          <Grid item xs={12}>
            <Divider sx={{ my: 1 }} />
            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  App Type
                </Typography>
                <Typography variant="body2" fontWeight="var(--font-weight-medium)">
                  {item.app_type || '—'}
                </Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Versión
                </Typography>
                <Typography variant="body2" fontWeight="var(--font-weight-medium)">
                  {item.app_version || '—'}
                </Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Packages
                </Typography>
                <Typography variant="body2" fontWeight="var(--font-weight-medium)" noWrap>
                  {item.packageNames?.join(', ') || '—'}
                </Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Products
                </Typography>
                <Typography variant="body2" fontWeight="var(--font-weight-medium)" noWrap>
                  {item.products?.join(', ') || '—'}
                </Typography>
              </Grid>
            </Grid>
          </Grid>

          {/* Acciones */}
          <Grid item xs={12}>
            <Box display="flex" justifyContent="flex-end" gap={1} flexWrap="wrap">
              {!item.udid && udidEdits[item.sn] && (
                <Tooltip title="Asociar UDID">
                  <Button
                    variant="contained"
                    color="success"
                    size="small"
                    disabled={postLoading}
                    onClick={() => onSaveUdid(
                      item.subscriber_code, 
                      item.sn, 
                      udidEdits[item.sn], 
                      opEdits[item.sn], 
                      item.validated_by_operator
                    )}
                    startIcon={<AddIcon />}
                    className="corporate-action-button success"
                  >
                    Asociar UDID
                  </Button>
                </Tooltip>
              )}
              
              {item.udid && item.validated_by_operator && (
                <Tooltip title="Desasociar UDID">
                  <Button
                    variant="contained"
                    color="error"
                    size="small"
                    disabled={postLoading}
                    onClick={() => onDisassociateUdid(item.udid, item.validated_by_operator)}
                    startIcon={<RemoveIcon />}
                    className="corporate-action-button error"
                  >
                    Desasociar UDID
                  </Button>
                </Tooltip>
              )}

              <Tooltip title="Ver detalles completos">
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<InfoIcon />}
                >
                  Detalles
                </Button>
              </Tooltip>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
});

SubscriberCard.displayName = 'SubscriberCard';

export default SubscriberCard;
