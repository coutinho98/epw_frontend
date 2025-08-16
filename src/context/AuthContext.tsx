import { createContext, useContext, useState, useEffect } from 'react';
import React from 'react';
import api from '../services/api';
import { User } from '../types/User';
import { AuthLoginDto } from '../types/AuthLoginDto';
import { toast } from 'sonner';

interface AuthResponse {
    user: User;
    accessToken: string;
    refreshToken: string;
    message?: string;
}

interface AuthContextType {
    user: User | null;
    isAdmin: boolean;
    isAuthenticated: boolean;
    loading: boolean;
    login: (credentials: AuthLoginDto) => Promise<void>;
    logout: () => void;
    forceLogout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: React.ReactNode;
}

const USER_KEY = 'user';

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const isAuthenticated = !!user;
    const isAdmin = user ? user.isAdmin : false;

    const login = async (credentials: AuthLoginDto) => {
        try {
            const response = await api.post<AuthResponse>('/auth/login', credentials);

            localStorage.setItem('accessToken', response.accessToken);
            localStorage.setItem('refreshToken', response.refreshToken);
            localStorage.setItem(USER_KEY, JSON.stringify(response.user));

            setUser(response.user);
            toast.success('Login realizado com sucesso!');
        } catch (error) {
            console.error('Falha no login:', error);
            toast.error('Falha no login. Verifique suas credenciais.');
            throw new Error('Falha no login');
        }
    };

    const logout = async () => {
        try {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem(USER_KEY);
            setUser(null);
            await api.post('/auth/logout', {});

        } catch (error) {
        } finally {
            toast.info('Você foi desconectado.');
        }
    };

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const accessToken = localStorage.getItem('accessToken');
                const refreshToken = localStorage.getItem('refreshToken');
                const storedUser = localStorage.getItem(USER_KEY);

                if (!accessToken || !refreshToken) {
                    setUser(null);
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                    localStorage.removeItem(USER_KEY);
                    setLoading(false);
                    return;
                }

                if (storedUser) {
                    try {
                        setUser(JSON.parse(storedUser));
                    } catch (e) {
                        console.error('Erro ao parsear dados do usuário:', e);
                    }
                }

                const response = await api.get<User>('/auth/me');

                if (response && response.email) {
                    setUser(response);
                    localStorage.setItem(USER_KEY, JSON.stringify(response));
                } else {
                    clearUserData();
                }
            } catch (error: any) {
                console.error('❌ Erro na validação da sessão:', error);

                if (error.status === 401 || error.message?.includes('Sessão expirada')) {
                    clearUserData();
                } else {
                    const storedUser = localStorage.getItem(USER_KEY);
                    if (storedUser) {
                        try {
                            setUser(JSON.parse(storedUser));
                        } catch (e) {
                            clearUserData();
                        }
                    } else {
                        clearUserData();
                    }
                }
            } finally {
                setLoading(false);
            }
        };

        const clearUserData = () => {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem(USER_KEY);
            setUser(null);
        };

        checkAuth();

        const handleUnauthorizedLogout = () => {
            clearUserData();
            toast.error('Sessão expirada. Faça login novamente.');
        };

        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'accessToken' && !e.newValue) {
                setUser(null);
            }
        };

        window.addEventListener('unauthorized-logout', handleUnauthorizedLogout);
        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('unauthorized-logout', handleUnauthorizedLogout);
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    const forceLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem(USER_KEY);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, isAdmin, isAuthenticated, loading, login, logout, forceLogout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth deve ser usado dentro de um AuthProvider');
    }
    return context;
};