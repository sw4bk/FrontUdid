import { useState } from 'react';
import postDataService from '../Services/postData';

const usePostData = (endpoint) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const executePost = async (postBody) => {
        setLoading(true);
        setError(null);
        setData(null);

        try {
            const response = await postDataService(endpoint, postBody);
            setData(response);
            return response;
        } catch (err) {
            setError(err);
            throw err; // Vuelve a lanzar el error para que el componente pueda manejarlo
        } finally {
            setLoading(false);
        }
    };

    return { data, loading, error, executePost };
};

export default usePostData;