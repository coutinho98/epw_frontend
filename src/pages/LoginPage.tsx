import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom'; 
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

const loginFormSchema = z.object({
    email: z.string().email({ message: 'E-mail inválido.' }),
    password: z.string().min(8, { message: 'A senha deve ter no mínimo 8 caracteres.' }),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

const LoginPage = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [loginError, setLoginError] = useState('');

    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginFormSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    });

    const onSubmit = async (data: LoginFormValues) => {
        setIsLoading(true);
        setLoginError('');


        try {
            await login(data);
            navigate('/'); 
        } catch (error) {
            setLoginError('Credenciais inválidas. Tente novamente.');
            console.error('Login error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-black text-white min-h-screen flex flex-col justify-center items-center p-4">
            <div className="w-full max-w-sm mx-auto">
                <div className="text-center mb-6">
                    <h1 className="text-3xl font-bold">Login</h1>
                </div>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {loginError && <p className="text-red-500 text-sm text-center">{loginError}</p>}
                    <div className="grid gap-2">
                        <Label htmlFor="email" className="text-white">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            className="h-12 bg-zinc-900 text-white placeholder-gray-500 border border-gray-700"
                            {...form.register('email')}
                        />
                        {form.formState.errors.email && (
                            <p className="text-red-500 text-xs mt-1">{form.formState.errors.email.message}</p>
                        )}
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="password" className="text-gray-200">Senha</Label>
                        <Input
                            id="password"
                            type="password"
                            className="h-12 bg-zinc-900 text-white placeholder-gray-500 border border-gray-700"
                            {...form.register('password')}
                        />
                        {form.formState.errors.password && (
                            <p className="text-red-500 text-xs mt-1">{form.formState.errors.password.message}</p>
                        )}
                    </div>
                    <Button
                        type="submit"
                        className="w-full h-12 bg-gray-200 text-black hover:bg-gray-300"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Carregando...' : 'Entrar'}
                    </Button>
                </form>
                <div className="text-sm w-full text-center mt-6">
                    {/* Alterado de <a> para Link */}
                    <Link to="/register" className="text-white hover:underline underline-offset-4">
                        Cadastre-se
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;