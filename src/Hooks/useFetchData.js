import { useState, useEffect } from 'react';
import api from '../Services/apiService';
import axios from 'axios';

// Ahora el hook acepta 'endpoint' y un objeto 'params' opcional
const useFetchData = (endpoint, params = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!endpoint) return;

    const source = axios.CancelToken.source();

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // La petición ahora usa el objeto 'params' para construir la URL
        const response = await api.get(endpoint, {
          cancelToken: source.token,
          params: params // Axios se encarga de serializar esto en la URL
        });
        setData(response.data);
      } catch (err) {
        if (!axios.isCancel(err)) {
          setError(err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    return () => source.cancel('Solicitud cancelada por desmontaje.');
  }, [endpoint, JSON.stringify(params)]); 

  return { data, loading, error };
};

export default useFetchData;
