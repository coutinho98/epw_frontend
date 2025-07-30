import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerUser } from '../services/authService';
import { toast } from 'sonner';

import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

const step1Schema = z.object({
    firstName: z.string().min(1, { message: 'O primeiro nome é obrigatório.' }),
    lastName: z.string().min(1, { message: 'O último nome é obrigatório.' }),
});

const step2Schema = z.object({
    email: z.string().email({ message: 'E-mail inválido.' }),
    password: z.string().min(8, { message: 'A senha deve ter no mínimo 8 caracteres.' }),
    confirmPassword: z.string().min(8, { message: 'A confirmação é obrigatória.' }),
}).refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem.",
    path: ["confirmPassword"],
});

type Step1FormValues = z.infer<typeof step1Schema>;
type Step2FormValues = z.infer<typeof step2Schema>;

const RegisterPage: React.FC = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [step1Data, setStep1Data] = useState<Step1FormValues | null>(null);

    const step1Form = useForm<Step1FormValues>({
        resolver: zodResolver(step1Schema),
        defaultValues: {
            firstName: '',
            lastName: '',
        },
    });

    const step2Form = useForm<Step2FormValues>({
        resolver: zodResolver(step2Schema),
        defaultValues: {
            email: '',
            password: '',
            confirmPassword: '',
        },
    });

    const onStep1Submit = (data: Step1FormValues) => {
        setStep1Data(data);
        setCurrentStep(2);
    };

    const onStep2Submit = async (data: Step2FormValues) => {
        if (!step1Data) return;
        
        setIsLoading(true);
        try {
            const fullData = {
                ...step1Data,
                ...data,
            };
            const response = await registerUser(fullData);
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

    const goBackToStep1 = () => {
        setCurrentStep(1);
    };

    return (
        <div className="bg-gradient-to-br from-slate-900 via-gray-900 to-black min-h-screen flex flex-col justify-center items-center p-4 relative overflow-hidden">
            
            <div className="w-full max-w-md mx-auto relative z-10">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-gray-100 to-gray-300 rounded-2xl mb-6 shadow-lg">
                        <svg className="w-8 h-8 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l-1 12H6L5 9z"/>
                        </svg>
                    </div>
                    <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-100 to-gray-300 mb-2">
                        EMPOWER FIT
                    </h1>
                    <p className="text-gray-400 text-lg">Crie sua conta</p>
                </div>

                <div className="flex items-center justify-center mb-8">
                    <div className="flex items-center space-x-4">
                        <div className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep >= 1 ? 'bg-gray-200 text-gray-900' : 'bg-gray-700 text-gray-400'} text-sm font-semibold`}>
                            1
                        </div>
                        <div className={`w-12 h-0.5 ${currentStep > 1 ? 'bg-gray-200' : 'bg-gray-700'}`}></div>
                        <div className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep >= 2 ? 'bg-gray-200 text-gray-900' : 'bg-gray-700 text-gray-400'} text-sm font-semibold`}>
                            2
                        </div>
                    </div>
                </div>

                <div className="bg-gray-900/80 backdrop-blur-lg border border-gray-700/50 rounded-3xl p-8 shadow-2xl">
                    {currentStep === 1 ? (
                        <>
                            <div className="text-center mb-6">
                                <h2 className="text-2xl font-semibold text-gray-100 mb-2">Dados Pessoais</h2>
                                <p className="text-gray-400 text-sm">Como devemos te chamar?</p>
                            </div>
                            
                            <form onSubmit={step1Form.handleSubmit(onStep1Submit)} className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="firstName" className="text-gray-200 text-sm font-medium">
                                        Nome
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="firstName"
                                            type="text"
                                            placeholder="Seu primeiro nome"
                                            className="h-14 bg-gray-800/50 text-white placeholder-gray-500 border border-gray-600/50 rounded-xl focus:border-gray-400 focus:ring-0 transition-all duration-200 pl-4 backdrop-blur-sm"
                                            {...step1Form.register('firstName')}
                                        />
                                        <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                                            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                                            </svg>
                                        </div>
                                    </div>
                                    {step1Form.formState.errors.firstName && (
                                        <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                                            </svg>
                                            {step1Form.formState.errors.firstName.message}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="lastName" className="text-gray-200 text-sm font-medium">
                                        Sobrenome
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="lastName"
                                            type="text"
                                            placeholder="Seu sobrenome"
                                            className="h-14 bg-gray-800/50 text-white placeholder-gray-500 border border-gray-600/50 rounded-xl focus:border-gray-400 focus:ring-0 transition-all duration-200 pl-4 backdrop-blur-sm"
                                            {...step1Form.register('lastName')}
                                        />
                                        <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                                            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                                            </svg>
                                        </div>
                                    </div>
                                    {step1Form.formState.errors.lastName && (
                                        <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                                            </svg>
                                            {step1Form.formState.errors.lastName.message}
                                        </p>
                                    )}
                                </div>

                                <div className="pt-2">
                                    <Button
                                        type="submit"
                                        className="w-full h-14 bg-gradient-to-r from-gray-100 to-gray-300 text-gray-900 hover:from-gray-200 hover:to-gray-400 font-semibold text-lg rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                                    >
                                        Continuar
                                    </Button>
                                </div>
                            </form>
                        </>
                    ) : (
                        <>
                            <div className="text-center mb-6">
                                <h2 className="text-2xl font-semibold text-gray-100 mb-2">Credenciais</h2>
                                <p className="text-gray-400 text-sm">Olá {step1Data?.firstName}! Agora defina seu acesso</p>
                            </div>
                            
                            <form onSubmit={step2Form.handleSubmit(onStep2Submit)} className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-gray-200 text-sm font-medium">
                                        Email
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="seu@email.com"
                                            className="h-14 bg-gray-800/50 text-white placeholder-gray-500 border border-gray-600/50 rounded-xl focus:border-gray-400 focus:ring-0 transition-all duration-200 pl-4 backdrop-blur-sm"
                                            {...step2Form.register('email')}
                                        />
                                        <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                                            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"/>
                                            </svg>
                                        </div>
                                    </div>
                                    {step2Form.formState.errors.email && (
                                        <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                                            </svg>
                                            {step2Form.formState.errors.email.message}
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
                                            placeholder="Mínimo 8 caracteres"
                                            className="h-14 bg-gray-800/50 text-white placeholder-gray-500 border border-gray-600/50 rounded-xl focus:border-gray-400 focus:ring-0 transition-all duration-200 pl-4 pr-12 backdrop-blur-sm"
                                            {...step2Form.register('password')}
                                        />
                                        <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                                            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                                            </svg>
                                        </div>
                                    </div>
                                    {step2Form.formState.errors.password && (
                                        <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                                            </svg>
                                            {step2Form.formState.errors.password.message}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword" className="text-gray-200 text-sm font-medium">
                                        Confirmar Senha
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="confirmPassword"
                                            type="password"
                                            placeholder="Repita sua senha"
                                            className="h-14 bg-gray-800/50 text-white placeholder-gray-500 border border-gray-600/50 rounded-xl focus:border-gray-400 focus:ring-0 transition-all duration-200 pl-4 pr-12 backdrop-blur-sm"
                                            {...step2Form.register('confirmPassword')}
                                        />
                                        <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                                            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                            </svg>
                                        </div>
                                    </div>
                                    {step2Form.formState.errors.confirmPassword && (
                                        <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                                            </svg>
                                            {step2Form.formState.errors.confirmPassword.message}
                                        </p>
                                    )}
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <Button
                                        type="button"
                                        onClick={goBackToStep1}
                                        className="flex-1 h-14 bg-transparent border border-gray-600/50 text-gray-200 hover:bg-gray-800/50 hover:border-gray-500 font-medium rounded-xl transition-all duration-200"
                                    >
                                        Voltar
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="flex-1 h-14 bg-gradient-to-r from-gray-100 to-gray-300 text-gray-900 hover:from-gray-200 hover:to-gray-400 font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <div className="flex items-center justify-center gap-2">
                                                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                                                </svg>
                                                Criando...
                                            </div>
                                        ) : (
                                            'Criar Conta'
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </>
                    )}

                    <div className="text-center mt-8">
                        <p className="text-gray-400 text-sm mb-3">
                            Já tem uma conta?
                        </p>
                        <Link 
                            to="/login" 
                            className="inline-flex items-center justify-center text-gray-200 hover:text-white font-medium transition-colors duration-200 hover:underline underline-offset-4"
                        >
                            Fazer login
                        </Link>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center mt-8">
                    <p className="text-gray-500 text-xs">
                        © 2024 EMPOWER FIT. Todos os direitos reservados.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;