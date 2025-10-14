import api from './apiService';

const postData = async (endpoint, data = {}) => {
    /**
     * @param {string} endpoint - La URL del endpoint de la API
     * @param {Object} [data={}] - El cuerpo de la petición para la petición POST
     * @returns {Promise<Object>} Datos de la respuesta
     * @throws {Error} Si ocurre un error de red o de la API
     */
    
    console.log('🔄 Iniciando petición POST a', endpoint, 'Datos:', data);
    try {
        const response = await api.post(endpoint, data);
        console.log('✅ Respuesta recibida:', response);
        console.log('📄 Data:', response.data)
        if (!response.data) {
            throw new Error("No se recibió data de la API");
        }
        return response.data;
    } catch (error) {
        console.error('❌ Error en postData:', error);
        throw error;
    }

}
export default postData;