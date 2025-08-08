import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import logo from '../assets/image/Coroa-branco.png'
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

import backgroundImage from '../assets/image/background.png';

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
        <div
            className="min-h-screen flex flex-col justify-center items-center p-4 relative overflow-hidden"
            style={{
                backgroundColor: '#EEE5DE',
                backgroundImage: `url(${backgroundImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                backgroundAttachment: 'fixed',
            }}
        >

            <div className="w-full max-w-md mx-auto relative z-10">
                <div className="bg-gray-900/80 backdrop-blur-lg border border-gray-700/50 rounded-3xl p-8 shadow-2xl">
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center justify-center mb-5">
                            <img
                                src={logo}
                                alt="EMPOWER FIT Logo"
                                className="w-20 h-20 object-contain"
                            />
                        </div>
                        <h1 className="text-4xl font-bold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-gray-100 to-gray-300 ">
                            EMPOWER FIT
                        </h1>
                    </div>

                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        {loginError && (
                            <div className="bg-red-900/20 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm text-center backdrop-blur-sm">
                                {loginError}
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-gray-200 text-sm font-medium">
                                Email
                            </Label>
                            <div className="relative">
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="email"
                                    className="h-14 bg-gray-800/50 text-white placeholder-gray-500 border border-gray-600/50 rounded-xl focus:border-gray-400 focus:ring-0 transition-all duration-200 pl-4 backdrop-blur-sm"
                                    {...form.register('email')}
                                />
                                <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                    </svg>
                                </div>
                            </div>
                            {form.formState.errors.email && (
                                <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    {form.formState.errors.email.message}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-gray-200 text-sm font-medium">
                                Senha
                            </Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    className="h-14 bg-gray-800/50 text-white placeholder-gray-500 border border-gray-600/50 rounded-xl focus:border-gray-400 focus:ring-0 transition-all duration-200 pl-4 pr-12 backdrop-blur-sm"
                                    {...form.register('password')}
                                />
                                <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                            </div>
                            {form.formState.errors.password && (
                                <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    {form.formState.errors.password.message}
                                </p>
                            )}
                        </div>

                        <div className="pt-2">
                            <Button
                                type="submit"
                                className="w-full h-14 bg-gradient-to-r from-gray-100 to-gray-300 text-gray-900 hover:from-gray-200 hover:to-gray-400 font-semibold text-lg rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Entrando...
                                    </div>
                                ) : (
                                    'Entrar'
                                )}
                            </Button>
                        </div>
                    </form>
                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-600/50"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-gray-900/80 text-gray-400">ou</span>
                        </div>
                    </div>
                    <div className="text-center">
                        <p className="text-gray-400 text-sm mb-3">
                            Ainda não tem uma conta?
                        </p>
                        <Link
                            to="/register"
                            className="inline-flex items-center justify-center w-full h-12 bg-transparent border border-gray-600/50 text-gray-200 hover:bg-gray-800/50 hover:border-gray-500 font-medium rounded-xl transition-all duration-200 hover:scale-[1.02]"
                        >
                            Criar conta
                        </Link>
                    </div>
                </div>
                <div className="text-center mt-8">
                    <p className="text-gray-500 text-xs">
                        © 2024 EMPOWER FIT. Todos os direitos reservados.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;