import { Register } from '@/types/Register';
import api from './api';

interface LoginCredentials {
    email: string;
    password: string;
}

interface UserData {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    isAdmin: boolean;
}

interface LoginResponse {
    accessToken: string;
    user: UserData;
    message?: string;
}

export const loginUser = async (credentials: LoginCredentials): Promise<LoginResponse> => {
    try {
        const data = await api.post<LoginResponse>('/auth/login', credentials);
        return data;
    } catch (error) {
        console.error('Erro na requisição de login:', error);
        throw error;
    }
};

export const logoutUser = async (): Promise<void> => {
    try {
        await api.post<void>('/auth/logout', {});
        console.log('logou success!!!')
    } catch (error) {
        console.error('error na req logou', error)
        throw error;
    }
}


export const registerUser = async (userData: Register): Promise<{ message: string }> => {
    try {
        const response = await api.post<{ message: string }>('/users', userData);
        return response;
    } catch (error: any) {
        console.error('Erro na requisição de registro:', error);
        throw error;
    }
}