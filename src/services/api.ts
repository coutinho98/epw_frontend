const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface RequestOptions extends RequestInit {
    headers?: HeadersInit;
    isRetry?: boolean;
}

interface FailedQueueItem {
    resolve: (value?: any) => void;
    reject: (reason?: any) => void;
    endpoint: string;
    options: RequestOptions;
}

let isRefreshing = false;
let failedQueue: FailedQueueItem[] = [];

const processQueue = (error: Error | null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            const originalHeaders = prom.options.headers as Record<string, string> || {};
            const newHeaders = { ...originalHeaders };
            delete newHeaders['Authorization'];
            
            const newConfig: RequestOptions = {
                ...prom.options,
                headers: newHeaders,
                isRetry: true
            };
            apiFetch(prom.endpoint, newConfig).then(prom.resolve).catch(prom.reject);
        }
    });
    failedQueue = [];
};

async function apiFetch<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const headers: Record<string, string> = {
        ...(options.headers as Record<string, string>),
    };

    if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }

    const config: RequestOptions = {
        ...options,
        headers,
        credentials: 'include',
    };

    try {
        const response = await fetch(`${BASE_URL}${endpoint}`, config);

        if (response.status === 401 && !options.isRetry) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject, endpoint, options });
                }) as Promise<T>;
            }

            isRefreshing = true;

            return new Promise<T>(async (resolve, reject) => {
                try {
                    const refreshResponse = await fetch(`${BASE_URL}/auth/refresh`, {
                        method: 'POST',
                        credentials: 'include',
                    });

                    if (!refreshResponse.ok) {
                        // Não é mais necessário remover do localStorage se o token não está lá.
                        localStorage.removeItem('user'); // Remove apenas o usuário.
                        window.dispatchEvent(new CustomEvent('unauthorized-logout'));
                        processQueue(new Error('Sessão expirada. Faça login novamente.'));
                        reject(new Error('Sessão expirada. Faça login novamente.'));
                        return;
                    }

                    const newConfigForOriginalRequest: RequestOptions = {
                        ...config,
                        isRetry: true
                    };
                    const originalResponse = await fetch(`${BASE_URL}${endpoint}`, newConfigForOriginalRequest);

                    if (!originalResponse.ok) {
                        let errorData: any = {};
                        try { errorData = await originalResponse.json(); } catch { /* ignore */ }
                        throw new Error(errorData.message || originalResponse.statusText || 'Erro ao re-tentar requisição.');
                    }

                    const originalData = await originalResponse.json();
                    processQueue(null);
                    resolve(originalData as T);

                } catch (refreshError: any) {
                    localStorage.removeItem('user');
                    window.dispatchEvent(new CustomEvent('unauthorized-logout'));
                    processQueue(refreshError);
                    reject(refreshError);
                } finally {
                    isRefreshing = false;
                }
            });
        }

        if (!response.ok) {
            let errorData: any = {};
            try {
                errorData = await response.json();
            } catch {
                errorData = { message: response.statusText || 'Erro desconhecido' };
            }
            const error = new Error(errorData.message || 'Algo deu errado');
            (error as any).status = response.status;
            (error as any).data = errorData;
            throw error;
        }

        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            return response.json() as Promise<T>;
        }
        return null as T;
    } catch (error) {
        throw error;
    }
}

const api = {
    get: <T>(endpoint: string, options?: RequestOptions) => apiFetch<T>(endpoint, { method: 'GET', ...options }),
    post: <T>(endpoint: string, data: any, options?: RequestOptions) => {
        if (data instanceof FormData) {
            return apiFetch<T>(endpoint, { method: 'POST', body: data, ...options });
        }
        return apiFetch<T>(endpoint, { method: 'POST', body: JSON.stringify(data), ...options });
    },
    patch: <T>(endpoint: string, data: any, options?: RequestOptions) => {
        if (data instanceof FormData) {
            return apiFetch<T>(endpoint, { method: 'PATCH', body: data, ...options });
        }
        return apiFetch<T>(endpoint, { method: 'PATCH', body: JSON.stringify(data), ...options });
    },
    delete: <T>(endpoint: string, options?: RequestOptions) => apiFetch<T>(endpoint, { method: 'DELETE', ...options }),
};

export default api;