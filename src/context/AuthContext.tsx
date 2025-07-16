// src/context/AuthContext.tsx
import { createContext, useContext, useState, useEffect } from 'react';
import React from 'react';
import api from '../services/api';
import { User } from '../types/User';
import { AuthLoginDto } from '../types/AuthLoginDto';

// Defina a interface para a resposta da API de login
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

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const isAuthenticated = !!user;
    const isAdmin = user ? user.isAdmin : false;

    // Função de login corrigida
    const login = async (credentials: AuthLoginDto) => {
    try {
        const response = await api.post<AuthResponse>('/auth/login', credentials);
        setUser(response.user);
        localStorage.setItem('accessToken', response.accessToken);
        console.log('3. API de login respondeu com sucesso. Usuário e token salvos.');
    } catch (error) {
        console.error('Falha no login:', error);
        throw new Error('Falha no login');
    }
};

    const logout = () => {
        api.post('/auth/logout', {}); // A chamada para logout precisa de um corpo vazio.
        setUser(null);
        localStorage.removeItem('accessToken');
    };

    useEffect(() => {
        const checkAuth = async () => {
            const accessToken = localStorage.getItem('accessToken');
            if (accessToken) {
                // Aqui você pode adicionar uma chamada para validar o token ou buscar o perfil do usuário
                // Se falhar, a rota protegida irá redirecionar
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