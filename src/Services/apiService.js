import axios from 'axios';


// ------------------- VARIABLES DE ENTORNO -------------------
const API_URL = import.meta.env.VITE_API_URL;


// ------------------- INSTANCIA DE AXIOS -------------------
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 30000, // Timeout de 30 segundos
});

// ------------------- MANEJO DE TOKENS -------------------
const getToken = () => localStorage.getItem('accessToken');

const getRefreshToken = () => localStorage.getItem('refreshToken');

const setToken = (token) => localStorage.setItem('accessToken', token);

const removeToken = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
};

// ------------------- COLA Y FLAGS DE REFRESH -------------------
let isRefreshing = false;
let failedQueue = [];


// ------------------- PROCESAMIENTO DE COLA -------------------
const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) prom.reject(error);
        else prom.resolve(token);
    });
    failedQueue = [];
};


// ------------------- SOLICITUD DE REFRESH TOKEN -------------------
const refreshToken = async () => {
    try {
        const refresh = getRefreshToken();
        if (!refresh) throw new Error('No refresh token available');

        const refreshResponse = await axios.post(
            `${API_URL}/auth/refresh/`,
            { refresh },
            { timeout: 15000 }
        );
        const { access } = refreshResponse.data;
        setToken(access);
        return access;
    } catch (error) {
        removeToken();
        window.dispatchEvent(new CustomEvent('tokenExpired'));
        throw error;
    }
};

// ------------------- ENDPOINTS PÚBLICOS -------------------
const publicEndpoints = [
    /^\/auth\/login\/?$/,
    /^\/auth\/register\/?$/,
    /^\/auth\/refresh\/?$/
];


// ------------------- THROTTLE DE EVENTOS DE ERROR -------------------
let lastErrorEvent = 0;
const ERROR_DEBOUNCE_MS = 1000;

const dispatchErrorEvent = (type, detail) => {
    const now = Date.now();
    if (now - lastErrorEvent > ERROR_DEBOUNCE_MS) {
        window.dispatchEvent(new CustomEvent(type, { detail }));
        lastErrorEvent = now;
    }
};

// ------------------- INTERCEPTORES DE AXIOS -------------------
api.interceptors.request.use((config) => {
    const isPublicEndpoint = publicEndpoints.some(rx => rx.test(config.url));
    if (!isPublicEndpoint) {
        const token = getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});


// ------------------- INTERCEPTOR DE RESPUESTA -------------------
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (!originalRequest) {
            handleError(error);
            return Promise.reject(error);
        }
        // Limite de reintentos para evitar loops infinitos
        originalRequest._retryCount = originalRequest._retryCount || 0;

        if (error.response?.status === 401 && originalRequest._retryCount < 1) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return api(originalRequest);
                }).catch(err => Promise.reject(err));
            }

            originalRequest._retry = true;
            originalRequest._retryCount += 1;
            isRefreshing = true;

            try {
                const newToken = await refreshToken();
                processQueue(null, newToken);
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return api(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                handleError(refreshError);
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }
        handleError(error);
        return Promise.reject(error);
    }
);



// ------------------- MANEJO CENTRALIZADO DE ERRORES -------------------
const handleError = (error) => {
    if (error.response) {
        const { status, data } = error.response;

        switch (status) {
            case 401:
                if (!error.config?.url?.includes('/auth/refresh/')) {
                    dispatchErrorEvent('authError', {
                        type: 'unauthorized',
                        message: 'Sesión expirada'
                    });
                }
                break;
            case 403:
                dispatchErrorEvent('authError', {
                    type: 'forbidden',
                    message: 'Sin permisos suficientes'
                });
                break;
            case 500:
                dispatchErrorEvent('serverError', {
                    message: 'Error interno del servidor'
                });
                break;
            default:
                // Puedes extender aquí para otros status
                console.error(`Error HTTP ${status}:`, data);
        }
    } else if (error.request) {
        if (error.code === 'ECONNABORTED') {
            dispatchErrorEvent('networkError', {
                message: 'El servidor está tardando demasiado en responder'
            });
        } else {
            dispatchErrorEvent('networkError', {
                message: 'Error de conexión con el servidor'
            });
        }
    } else {
        console.error('Error de configuración:', error.message);
    }
};

// ------------------- EXPORTS -------------------
export { api as default, removeToken, getToken };