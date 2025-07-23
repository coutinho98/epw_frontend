import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerUser } from '../services/authService';
import { toast } from 'sonner';

import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

const registerFormSchema = z.object({
    firstName: z.string().min(1, { message: 'O primeiro nome é obrigatório.' }),
    lastName: z.string().min(1, { message: 'O último nome é obrigatório.' }),
    email: z.string().email({ message: 'E-mail inválido.' }),
    password: z.string().min(8, { message: 'A senha deve ter no mínimo 8 caracteres.' }),
    confirmPassword: z.string().min(8, { message: 'A senha deve ter no mínimo 8 caracteres.' }),
});

type RegisterFormValues = z.infer<typeof registerFormSchema>;

const RegisterPage: React.FC = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<RegisterFormValues>({
        resolver: zodResolver(registerFormSchema),
        defaultValues: {
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            confirmPassword: '',
        },
    });

    const onSubmit = async (data: RegisterFormValues) => {
        setIsLoading(true);
        try {
            const response = await registerUser(data);
            toast.success(response.message || 'Conta criada!', {
                description: 'Você já pode fazer login.',
            });
            navigate('/');
        } catch (error: any) {
            console.error('Erro no registro:', error);
            toast.error('Falha no registro.', {
                description: error.message || 'Verifique suas informações e tente novamente.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center h-screen bg-black text-white">
            <div className="w-full max-w-md p-8 space-y-6   ">
                <h2 className="text-3xl font-bold text-center">Criar Conta</h2>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid gap-2">
                        <Label htmlFor="firstName" className="text-white">Nome</Label>
                        <Input
                            id="firstName"
                            type="text"
                            className="h-12 bg-zinc-900 text-white placeholder-gray-500 border border-gray-700"
                            {...form.register('firstName')}
                        />
                        {form.formState.errors.firstName && (
                            <p className="text-red-500 text-xs mt-1">{form.formState.errors.firstName.message}</p>
                        )}
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="lastName" className="text-white">Sobrenome</Label>
                        <Input
                            id="lastName"
                            type="tezt"
                            className="h-12 bg-zinc-900 text-white placeholder-gray-500 border border-gray-700"
                            {...form.register('lastName')}
                        />
                        {form.formState.errors.lastName && (
                            <p className="text-red-500 text-xs mt-1">{form.formState.errors.lastName.message}</p>
                        )}
                    </div>
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
                        <Label htmlFor="password" className="text-white">Senha</Label>
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
                     <div className="grid gap-2">
                        <Label htmlFor="confirmPassword" className="text-white">Repetir Senha</Label>
                        <Input
                            id="confirmPassword"
                            type="password"
                            className="h-12 bg-zinc-900 text-white placeholder-gray-500 border border-gray-700"
                            {...form.register('confirmPassword')}
                        />
                        {form.formState.errors.password && (
                            <p className="text-red-500 text-xs mt-1">{form.formState.errors.password.message}</p>
                        )}
                    </div>
                    <Button
                        type="submit"
                        className="w-full bg-white text-black py-6 text-sm cursor-pointer hover:bg-gray-300"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Registrando...' : 'Registrar'}
                    </Button>
                </form>
                <p className="text-center text-sm text-gray-400">
                    Já tem uma conta?{' '}
                    <Link to="/" className="text-white hover:underline underline-offset-4">
                        Faça Login
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default RegisterPage;