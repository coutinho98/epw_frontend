import { createContext, useContext, useState, useEffect } from 'react';
import React from 'react';
import api from '../services/api';
import { User } from '../types/User';
import { AuthLoginDto } from '../types/AuthLoginDto';

interface AuthResponse {
    accessToken: string;
    user: User;
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
const TOKEN_KEY = 'jwt_token';

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const isAuthenticated = !!user;
    const isAdmin = user ? user.isAdmin : false;

    const login = async (credentials: AuthLoginDto) => {
        try {
            const response = await api.post<AuthResponse>('/auth/login', credentials);
            setUser(response.user);
            localStorage.setItem(TOKEN_KEY, response.accessToken);
            localStorage.setItem(USER_KEY, JSON.stringify(response.user));
        } catch (error) {
            console.error('Falha no login:', error);
            throw new Error('Falha no login');
        }
    };

    const logout = () => {
        api.post('/auth/logout', {});
        setUser(null);
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
    };

    useEffect(() => {
        const checkAuth = async () => {
            const jwtToken = localStorage.getItem(TOKEN_KEY);
            const storedUser = localStorage.getItem(USER_KEY);
            
            if (jwtToken && storedUser) {
                try {
                    const parsedUser: User = JSON.parse(storedUser);
                    setUser(parsedUser);
                } catch (error) {
                    console.error('Falha ao restaurar sessão:', error);
                    localStorage.removeItem(TOKEN_KEY);
                    localStorage.removeItem(USER_KEY);
                    setUser(null);
                }
            }
            setLoading(false);
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