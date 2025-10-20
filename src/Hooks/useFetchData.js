import { useState, useEffect, useCallback } from 'react';
import api from '../Services/apiService';
import axios from 'axios';

const useFetchData = (endpoint, params = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reloadIndex, setReloadIndex] = useState(0); // <- nuevo gatillo

  const refetch = useCallback(() => setReloadIndex(i => i + 1), []);

  useEffect(() => {
    if (!endpoint) return;
    const source = axios.CancelToken.source();

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get(endpoint, {
          cancelToken: source.token,
          params
        });
        setData(response.data);
      } catch (err) {
        if (!axios.isCancel(err)) setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    return () => source.cancel('Solicitud cancelada por desmontaje.');
  }, [endpoint, JSON.stringify(params), reloadIndex]); // <- incluye reloadIndex

  return { data, loading, error, refetch }; // <- expón refetch
};

export default useFetchData;

