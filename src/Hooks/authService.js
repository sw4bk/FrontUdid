import api from '../Services/apiService';

export const authService = {
    login: async (credentials) => {
        const response = await api.post('/auth/login/', credentials);
        const { access, refresh } = response.data || {};

        if (access && refresh) {
            localStorage.setItem('accessToken', access);
            localStorage.setItem('refreshToken', refresh);
            console.log('Login exitoso:', response.data);
            return response.data;
        } else {
            throw new Error('No se recibieron tokens válidos');
        }
    },

    logout: async () => {
        try {
            const refresh = localStorage.getItem('refreshToken');
            if (refresh) {
                await api.post('/auth/logout/', { refresh });
            }
        } catch (error) {
            console.error('Error durante logout:', error);
        } finally {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
        }
    },

    register: async (userData) => {
        const response = await api.post('/auth/register/', userData);
        return response.data;
    },

    // Esta es la función que te está dando error,
    // por favor, asegúrate de que esté en tu archivo.
    isAuthenticated: () => {
        return !!localStorage.getItem('accessToken');
    },
};