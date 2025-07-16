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
        const response = await fetch('http://localhost:3000/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
        });

        const data: LoginResponse = await response.json(); 

        if (!response.ok) {
            throw new Error(data.message || 'Erro desconhecido ao fazer login');
        }

        return data; 
    } catch (error) {
        console.error('Erro na requisição de login:', error);
        throw error;
    }
};

export const logoutUser = async (): Promise<void> => {
    try {
        const response = await fetch('http://localhost:3000/auth/logout', {
            method: 'POST',
            credentials: 'include',
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Erro ao fazer logout');
        }
//criar route logou backend
        console.log('Logout bem-sucedido no backend.');
    } catch (error) {
        console.error('Erro na requisição de logout:', error);
        throw error;
    }
};