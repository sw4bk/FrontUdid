import { useState, useEffect, useCallback, useMemo } from 'react';

import {
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Paper, 
  Button, 
  Typography, 
  TextField, 
  Box,
  Chip,
  Tooltip,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  ViewList as TableViewIcon,
  ViewModule as CardViewIcon,
  Dashboard as DashboardIcon,
  Search as SearchIcon,
  Clear as ClearIcon
} from '@mui/icons-material';

import useFetchData from '../Hooks/useFetchData';
import usePostData from '../Hooks/usePostData';
import { useNotifications } from '../Hooks/NotificationProvider.jsx';
import SubscriberCard from '../components/SubscriberCard.jsx';

import '../styles/Dashboard.scss';

const Dashboard = () => {
  const { showSuccess, showError, showWarning, showInfo } = useNotifications();
  const [udidEdits, setUdidEdits] = useState({});
  const [opEdits, setOpEdits] = useState({});
  const [viewMode, setViewMode] = useState('table'); // 'table' o 'cards'

  // Búsqueda: GET /search/?subscriber_code=... y/o ?sn=... (solo esos parámetros)
  const [filterSubscriberCode, setFilterSubscriberCode] = useState('');
  const [filterSn, setFilterSn] = useState('');

  const queryParams = useMemo(() => {
    const params = {};
    if (filterSubscriberCode.trim()) params.subscriber_code = filterSubscriberCode.trim();
    if (filterSn.trim()) params.sn = filterSn.trim();
    return params;
  }, [filterSubscriberCode, filterSn]);

  const { data, loading, error, refetch } = useFetchData('/search/', queryParams);
  
  // Hook para la asociación de UDID
  const { executePost: executeAssociate, loading: associateLoading, error: associateError } = usePostData('/validate-and-associate-udid/');

  // Nuevo hook para la desasociación de UDID
  const { executePost: executeDisassociate, loading: disassociateLoading, error: disassociateError } = usePostData('/disassociate-udid/');

  const handleUdidChange = useCallback((sn, value) => {
    setUdidEdits(prev => ({ ...prev, [sn]: value }));
  }, []);

  const handleOPChange = useCallback((sn, value) => {
    setOpEdits(prev => ({ ...prev, [sn]: value }));
  }, []);

  const handleSearch = useCallback(() => {
    refetch();
    showInfo('Buscando...');
  }, [refetch, showInfo]);

  const handleClearFilters = useCallback(() => {
    setFilterSubscriberCode('');
    setFilterSn('');
    showInfo('Filtros limpiados');
  }, [showInfo]);

  // Función para guardar UDID, ahora con todos los parámetros
  const handleSaveUdid = async (subscriberCode, sn, udidValue, operador) => {
    // Validación: El valor del UDID no debe estar vacío
    if (!udidValue.trim()) {
      showWarning('Por favor, ingresa un UDID válido');
      return;
    }

    // Validación básica de formato UDID (ejemplo: debe tener al menos 20 caracteres)
    if (udidValue.length < 8) {
      showError('El UDID debe tener al menos 8 caracteres');
      return;
    }

    // Validación de operador
    if (!operador || !operador.trim()) {
      showWarning('Por favor, ingresa un operador válido');
      return;
    }
    
    const postBody = {
      subscriber_code: subscriberCode,
      udid: udidValue.toLowerCase(), // Convertir UDID a minúsculas para el backend
      sn: sn,
      operator_id: operador,
      method: 'manual'
    };

    try {
      await executeAssociate(postBody);
      showSuccess(`UDID ${udidValue} asociado correctamente para SN: ${sn}`);
      refetch(); // ✅ vuelve a cargar la data
      setUdidEdits(prev => {
        const newState = { ...prev };
        delete newState[sn];
        return newState;
      });
    } catch (err) {
      console.error('Error al asociar UDID:', err);
      showError('Error al asociar UDID. Verifica los datos e inténtalo de nuevo');
    }
  };
  
  // Nueva función para desasociar un UDID
  const handleDisassociateUdid = async (udid, operador) => {
    if (!udid.trim()) {
      showWarning('No se puede desasociar un UDID vacío');
      return;
    }

    const postBody = {
      udid: udid.toLowerCase(), // Convertir UDID a minúsculas para el backend
      operador: operador
    };

    try {
      await executeDisassociate(postBody);
      showSuccess(`UDID ${udid} desasociado correctamente`);
      refetch(); // ✅ vuelve a cargar la data
    } catch (err) {
      console.error('Error al desasociar UDID:', err);
      showError('Error al desasociar UDID. Inténtalo de nuevo');
    }
  };

  const subscriber = useMemo(() => data?.results || [], [data?.results]);
  const postLoading = associateLoading || disassociateLoading;

  // Efecto para mostrar notificaciones de error
  useEffect(() => {
    if (error) {
      showError(`Error al cargar datos: ${error.message || 'Error desconocido'}`);
    }
    if (associateError) {
      showError(`Error de asociación: ${associateError.message || 'Error desconocido'}`);
    }
    if (disassociateError) {
      showError(`Error de desasociación: ${disassociateError.message || 'Error desconocido'}`);
    }
  }, [error, associateError, disassociateError, showError]);

  return (
    <Box className="dashboard-wrapper">
      {/* Header del Dashboard */}
      <Box className="dashboard-header">
        <Box>
          <Typography className="dashboard-title">
            <DashboardIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Dashboard de Suscriptores
          </Typography>
          <Typography className="dashboard-subtitle">
            Gestión de UDIDs y operadores - {data?.count ?? 0} registros totales
          </Typography>
        </Box>
      </Box>

      {/* Búsqueda: /search/?subscriber_code=... y/o ?sn=... */}
      <Box className="dashboard-search">
        <TextField
          className="filter-input"
          size="small"
          placeholder="Subscriber code"
          value={filterSubscriberCode}
          onChange={(e) => setFilterSubscriberCode(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <TextField
          className="filter-input"
          size="small"
          placeholder="SN"
          value={filterSn}
          onChange={(e) => setFilterSn(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleSearch}
          disabled={loading}
          startIcon={<SearchIcon />}
          className="search-button"
        >
          Buscar
        </Button>
        <Button
          variant="outlined"
          onClick={handleClearFilters}
          disabled={loading}
          startIcon={<ClearIcon />}
          className="clear-button"
        >
          Limpiar
        </Button>
      </Box>

      {/* Controles de Vista */}
      <Box className="view-controls">
        <Box className="view-toggle">
          <button
            className={`toggle-button ${viewMode === 'table' ? 'active' : ''}`}
            onClick={() => setViewMode('table')}
          >
            <TableViewIcon sx={{ mr: 1 }} />
            Vista Tabla
          </button>
          <button
            className={`toggle-button ${viewMode === 'cards' ? 'active' : ''}`}
            onClick={() => setViewMode('cards')}
          >
            <CardViewIcon sx={{ mr: 1 }} />
            Vista Cards
          </button>
        </Box>
      </Box>

      {/* Estados de Carga */}
      {loading && (
        <Box className="loading-state">
          <CircularProgress size={40} />
          <Typography className="loading-text">Cargando datos...</Typography>
        </Box>
      )}

      {/* Estado Vacío */}
      {!loading && (!data?.results || data.results.length === 0) && (
        <Box className="empty-state">
          <Typography className="empty-icon">📊</Typography>
          <Typography className="empty-title">No hay datos disponibles</Typography>
          <Typography className="empty-description">
            No se encontraron suscriptores para mostrar en esta página.
          </Typography>
        </Box>
      )}

      {/* Contenido Principal */}
      {!loading && subscriber.length > 0 && (
        <>
          {viewMode === 'table' ? (
            <>
              <TableContainer component={Paper} className="corporate-table">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Subscriber Code</TableCell>
                    <TableCell>Nombre</TableCell>
                    <TableCell>Apellido</TableCell>
                    <TableCell>SN</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell>UDID</TableCell>
                    <TableCell>UDID Status</TableCell>
                    <TableCell>Packages</TableCell>
                    <TableCell>Products</TableCell>
                    <TableCell>App Type</TableCell>
                    <TableCell>App Version</TableCell>
                    <TableCell>Last Activation</TableCell>
                    <TableCell>Operador</TableCell>
                    <TableCell>Acciones</TableCell>
                  </TableRow>
                </TableHead>
              <TableBody>
                {data.results.map((item, index) => (
                  <TableRow key={item.sn || index}>
                    <TableCell>{item.subscriber_code}</TableCell>
                    <TableCell>{item.first_name}</TableCell>
                    <TableCell>{item.last_name}</TableCell>
                    <TableCell>{item.sn}</TableCell>
                    <TableCell>
                      <Chip
                        label={item.activated ? 'Activo' : 'Inactivo'}
                        color={item.activated ? 'success' : 'default'}
                        size="small"
                        icon={item.activated ? <CheckIcon /> : <CancelIcon />}
                        className={item.activated ? 'status-active' : 'status-inactive'}
                      />
                    </TableCell>
                    <TableCell>
                      {item.udid ? (
                        item.udid
                      ) : (
                        <TextField
                          size="small"
                          variant="outlined"
                          value={udidEdits[item.sn] || ''}
                          placeholder="UDID"
                          onChange={(e) => handleUdidChange(item.sn, e.target.value)}
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      {item.udid_status ? (
                        <Chip
                          label={item.udid_status}
                          color={item.udid_status === 'active' ? 'success' : 'warning'}
                          size="small"
                          className={item.udid_status === 'active' ? 'status-active' : 'status-pending'}
                        />
                      ) : (
                        '—'
                      )}
                    </TableCell>
                    <TableCell>{item.packageNames?.join(', ') || '—'}</TableCell>
                    <TableCell>{item.products?.join(', ') || '—'}</TableCell>
                    <TableCell>{item.app_type || '—'}</TableCell>
                    <TableCell>{item.app_version || '—'}</TableCell>
                    <TableCell>{item.lastActivation || '—'}</TableCell>
                    <TableCell>
                      {item.validated_by_operator ? (
                        item.validated_by_operator
                      ) : (
                        <TextField
                          size="small"
                          variant="outlined"
                          value={opEdits[item.sn] || ''}
                          placeholder="OPERADOR"
                          onChange={(e) => handleOPChange(item.sn, e.target.value)}
                        />
                      )}</TableCell>
                    <TableCell>
                      {!item.udid && udidEdits[item.sn] && (
                        <Tooltip title="Asociar UDID">
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            disabled={postLoading}
                            onClick={() => handleSaveUdid(item.subscriber_code, item.sn, udidEdits[item.sn],opEdits[item.sn] ,item.validated_by_operator)}
                            className="corporate-action-button success"
                            startIcon={<AddIcon />}
                          >
                            Asociar
                          </Button>
                        </Tooltip>
                      )}
                      {item.udid && item.validated_by_operator && (
                        <Tooltip title="Desasociar UDID">
                          <Button
                            size="small"
                            variant="contained"
                            color="error"
                            disabled={postLoading}
                            onClick={() => handleDisassociateUdid(item.udid, item.validated_by_operator)}
                            className="corporate-action-button error"
                            startIcon={<RemoveIcon />}
                          >
                            Desasociar
                          </Button>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
            </>
          ) : (
            // Vista Cards
            <>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 3 }}>
                {data.results.map((item, index) => (
                  <SubscriberCard
                    key={item.sn || index}
                    item={item}
                    udidEdits={udidEdits}
                    opEdits={opEdits}
                    onUdidChange={handleUdidChange}
                    onOpChange={handleOPChange}
                    onSaveUdid={handleSaveUdid}
                    onDisassociateUdid={handleDisassociateUdid}
                    postLoading={postLoading}
                  />
                ))}
              </Box>
            </>
          )}
        </>
      )}
    </Box>
  );
};

export default Dashboard;