import { createContext, useContext, useState, useEffect } from 'react';
import React from 'react';
import api from '../services/api';
import { User } from '../types/User';
import { AuthLoginDto } from '../types/AuthLoginDto';
import { toast } from 'sonner';

interface AuthResponse {
    user: User;
    message?: string;
}

interface AuthContextType {
    user: User | null;
    isAdmin: boolean;
    isAuthenticated: boolean;
    loading: boolean;
    login: (credentials: AuthLoginDto) => Promise<void>;
    logout: () => void;
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
            setUser(response.user);
            localStorage.setItem(USER_KEY, JSON.stringify(response.user));
            toast.success('Login realizado com sucesso!');
        } catch (error) {
            console.error('Falha no login:', error);
            toast.error('Falha no login. Verifique suas credenciais.');
            throw new Error('Falha no login');
        }
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout', {});
        } catch (error) {
            console.error('Erro ao fazer logout:', error);
        } finally {
            setUser(null);
            localStorage.removeItem(USER_KEY);
            toast.info('Você foi desconectado.');
        }
    };

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await api.get<User>('/auth/me'); 
                if (response && response.email) {
                    setUser(response);
                    localStorage.setItem(USER_KEY, JSON.stringify(response));
                } else {
                    setUser(null);
                    localStorage.removeItem(USER_KEY);
                }
            } catch (error) {
                console.error('Sessão inválida ou expirada. Limpando dados do usuário.', error);
                setUser(null);
                localStorage.removeItem(USER_KEY);
            } finally {
                setLoading(false);
            }
        };
        checkAuth();
    }, []);

    return (
        <AuthContext.Provider value={{ user, isAdmin, isAuthenticated, loading, login, logout }}>
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