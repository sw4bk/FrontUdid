import React, { useState, useEffect } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Button, Typography, TextField, Box
} from '@mui/material';

import { useAuth } from '../Hooks/useAuth';
import '../Styles/Dashboard.scss';

const Dashboard = () => {
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [udidEdits, setUdidEdits] = useState({});
  
  const { fetchSubscriberInfo, isAuthenticated } = useAuth();

  // Función para cargar datos
  const loadData = async (pageNumber = page) => {
    if (!isAuthenticated) return;
    
    try {
      setLoading(true);
      setError(null);
      const result = await fetchSubscriberInfo(pageNumber);
      console.log('Datos cargados:', result);
      setData(result);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar datos');
      console.error('Error al cargar datos:', err);
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos cuando cambia la página o al montar el componente
  useEffect(() => {
    loadData(page);
  }, [page, isAuthenticated]); // Solo depende de page e isAuthenticated

  const handlePrevious = () => {
    if (page > 1) {
      console.log('Cambiando a la página anterior:', page - 1);
      setPage(prev => prev - 1);
    }
  };

  const handleNext = () => {
    if (data?.current_page < data?.total_pages) {
      console.log('Cambiando a la siguiente página:', page + 1);
      setPage(prev => prev + 1);
    }
  };

  const handleUdidChange = (sn, value) => {
    console.log(`Cambiando UDID para SN: ${sn}, nuevo valor: ${value}`);
    setUdidEdits(prev => ({ ...prev, [sn]: value }));
  };

  // Función para actualizar UDID (puedes expandir esto más tarde)
  const handleSaveUdid = async (sn, udidValue) => {
    try {
      // Aquí implementarías la llamada a la API para guardar el UDID
      console.log(`Guardando UDID ${udidValue} para dispositivo SN: ${sn}`);
      // Después de guardar exitosamente, refrescar los datos
      await loadData();
      // Limpiar el campo de edición
      setUdidEdits(prev => {
        const newEdits = { ...prev };
        delete newEdits[sn];
        return newEdits;
      });
    } catch (err) {
      console.error('Error al guardar UDID:', err);
    }
  };

  // Si no está autenticado, no mostrar nada o redirigir
  if (!isAuthenticated) {
    return (
      <Box className="dashboard-wrapper">
        <Typography>Debe iniciar sesión para ver esta página.</Typography>
      </Box>
    );
  }

  return (
    <Box className="dashboard-wrapper">
      <Typography variant="h4" gutterBottom>
        Dashboard de Suscriptores
      </Typography>

      {loading && <Typography>Cargando datos...</Typography>}
      {error && (
        <Typography color="error">
          Error: {error}
        </Typography>
      )}

      {!loading && data?.results?.length > 0 && (
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
                          placeholder="Ingresar UDID"
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
                      {!item.udid && udidEdits[item.sn] && (
                        <Button
                          size="small"
                          variant="contained"
                          color="primary"
                          onClick={() => handleSaveUdid(item.sn, udidEdits[item.sn])}
                        >
                          Guardar
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
              disabled={page === 1 || loading}
            >
              ⬅ Anterior
            </Button>

            <Typography className="pagination-info">
              Página {data.current_page} de {data.total_pages}
            </Typography>

            <Button
              variant="contained"
              onClick={handleNext}
              disabled={data.current_page >= data.total_pages || loading}
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