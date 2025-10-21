import { useState, useEffect } from 'react';

import {Table, TableBody, TableCell, TableContainer, TableHead, TableRow,Paper, Button, Typography, TextField, Box} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

import useFetchData from '../Hooks/useFetchData';
import usePostData from '../Hooks/usePostData';
import { useNotifications } from '../Hooks/NotificationProvider.jsx';

import '../styles/Dashboard.scss';

const Dashboard = () => {
  const { showSuccess, showError, showWarning, showInfo } = useNotifications();
  const [udidEdits, setUdidEdits] = useState({});
  const [opEdits, setOpEdits] = useState({});
  const [page, setPage] = useState(1);

  const { data, loading, error, refetch } = useFetchData(`/subscriberinfo/?page=${page}`);
  
  // Hook para la asociación de UDID
  const { executePost: executeAssociate, loading: associateLoading, error: associateError } = usePostData('/validate-and-associate-udid/');

  // Nuevo hook para la desasociación de UDID
  const { executePost: executeDisassociate, loading: disassociateLoading, error: disassociateError } = usePostData('/disassociate-udid/');

  const handleUdidChange = (sn, value) => {
    setUdidEdits(prev => ({ ...prev, [sn]: value }));
  };

  const handleOPChange = (sn, value) => {
    setOpEdits(prev => ({ ...prev, [sn]: value }));
  };

  const handlePrevious = () => {
    if (page > 1) {
      setPage(prev => prev - 1);
      showInfo(`Navegando a página ${page - 1}`);
    }
  };

  const handleNext = () => {
    if (data?.current_page < data?.total_pages) {
      setPage(prev => prev + 1);
      showInfo(`Navegando a página ${page + 1}`);
    }
  };

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

  const subscriber = data?.results || [];
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
      {loading && (
        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <Typography>Cargando datos...</Typography>
        </Box>
      )}

      {!loading && subscriber.length > 0 && (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Subscriber Code</TableCell>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Apellido</TableCell>
                  <TableCell>SN</TableCell>
                  <TableCell>Activated</TableCell>
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
                    <TableCell>{item.activated ? 'Sí' : 'No'}</TableCell>
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
                    <TableCell>{item.udid_status || '—'}</TableCell>
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
                        <Button
                          size="small"
                          variant="contained"
                          color="primary"
                          disabled={postLoading}
                          onClick={() => handleSaveUdid(item.subscriber_code, item.sn, udidEdits[item.sn],opEdits[item.sn] ,item.validated_by_operator)}
                        >
                          {<AddIcon />}
                        </Button>
                      )}
                      {item.udid && item.validated_by_operator && (
                        <Button
                          size="small"
                          variant="contained"
                          disabled={postLoading}
                          onClick={() => handleDisassociateUdid(item.udid, item.validated_by_operator)}
                        >
                          {<RemoveIcon />}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Box className="pagination-controls">
            <Button
              variant="contained"
              onClick={handlePrevious}
              disabled={page === 1 || loading || postLoading}
            >
              ⬅ Anterior
            </Button>
            <Typography className="pagination-info">
              Página {data.current_page} de {data.total_pages}
            </Typography>
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={data.current_page >= data.total_pages || loading || postLoading}
            >
              Siguiente ➡
            </Button>
          </Box>
        </>
      )}

      {!loading && (!data?.results || data.results.length === 0) && (
        <Typography>No hay datos de suscriptores disponibles.</Typography>
      )}
    </Box>
  );
};

export default Dashboard;