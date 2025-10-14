import api from './apiService';


const fetchData = async (endpoint, params = {}) => {
    /**
     * @param {string} endpoint - La URL del endpoint de la API
     * @param {Object} [params={}] - Parámetros opcionales para la petición GET
     * @returns {Promise<Object>} Datos de la respuesta
     * @throws {Error} Si ocurre un error de red o de la API
     */

    console.log('🔄 Iniciando petición a', endpoint);
    try {
        const response = await api.get(endpoint, { params });
        console.log('✅ Respuesta recibida:', response);
        console.log('📄 Data:', response.data);

        if (!response.data) {
            throw new Error("No se recibió data de la API");
        }
        return response.data;
    } catch (error) {
        console.error('❌ Error en fetchSubscriberInfo:', error);
        throw error;
    }


};
export default fetchData;


