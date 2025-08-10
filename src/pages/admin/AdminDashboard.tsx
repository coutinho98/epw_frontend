import { useState, useEffect } from 'react';
import api from '@/services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
    ShoppingCart,
    Package,
    DollarSign,
    TrendingUp,
    AlertTriangle,
    Star,
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface DashboardData {
    totalProducts: number;
    totalVariants: number;
    featuredProducts: number;
    availableProducts: number;
    totalViews: number;
    totalSales: number;
    totalRevenue: number;
    averageOrderValue: number;
    conversionRate: number;
    topProducts: Array<{
        id: string;
        name: string;
        sales: number;
        revenue: number;
        views: number;
    }>;
    lowStockProducts: Array<{
        id: string;
        name: string;
        variant: string;
        stock: number;
    }>;
    salesByMonth: Array<{
        month: string;
        sales: number;
        revenue: number;
    }>;
    productsByCategory: Array<{
        category: string;
        count: number;
        color: string;
    }>;
}

const AdminDashboard = () => {
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            try {
                // Substitua a chamada com dados mockados pela chamada real à API
                const response = await api.get<DashboardData>('/dashboard/stats');
                setDashboardData(response);
            } catch (err: any) {
                setError(err.message || 'Falha ao carregar dados do dashboard.');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen text-white">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-screen text-red-500">
                <p>{error}</p>
            </div>
        );
    }

    if (!dashboardData) {
        return null;
    }

    const StatCard = ({ title, value, description, icon: Icon, trend }: {
        title: string;
        value: string | number;
        description: string;
        icon: any;
        trend?: { value: number; isPositive: boolean };
    }) => (
        <Card className="bg-zinc-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">{title}</CardTitle>
                <Icon className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-white">{value}</div>
                <p className="text-xs text-gray-400 mt-1">{description}</p>
                {trend && (
                    <div className={`flex items-center mt-2 text-xs ${trend.isPositive ? 'text-green-400' : 'text-red-400'}`}>
                        <TrendingUp className={`h-3 w-3 mr-1 ${trend.isPositive ? '' : 'rotate-180'}`} />
                        {Math.abs(trend.value)}% em relação ao mês anterior
                    </div>
                )}
            </CardContent>
        </Card>
    );

    return (
        <div className="p-6 bg-zinc-900 min-h-screen text-white">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white">Dashboard</h1>
                <p className="text-gray-400 mt-2">Visão geral do seu e-commerce</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="Total de Produtos"
                    value={dashboardData.totalProducts}
                    description={`${dashboardData.availableProducts} disponíveis, ${dashboardData.featuredProducts} em destaque`}
                    icon={Package}
                    trend={{ value: 12, isPositive: true }}
                />
                <StatCard
                    title="Receita Total"
                    value={`R$ ${dashboardData.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                    description="Vendas acumuladas"
                    icon={DollarSign}
                    trend={{ value: 8.2, isPositive: true }}
                />
                <StatCard
                    title="Total de Vendas"
                    value={dashboardData.totalSales}
                    description={`Ticket médio: R$ ${dashboardData.averageOrderValue.toFixed(2)}`}
                    icon={ShoppingCart}
                    trend={{ value: 15.3, isPositive: true }}
                />
                <StatCard
                    title="Taxa de Conversão"
                    value={`${dashboardData.conversionRate}%`}
                    description={`${dashboardData.totalViews.toLocaleString()} visualizações`}
                    icon={TrendingUp}
                    trend={{ value: 2.1, isPositive: true }}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <Card className="bg-zinc-800 border-gray-700">
                    <CardHeader>
                        <CardTitle className="text-white">Vendas por Mês</CardTitle>
                        <CardDescription className="text-gray-400">Evolução mensal de vendas e receita</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={dashboardData.salesByMonth}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis dataKey="month" stroke="#9CA3AF" />
                                <YAxis stroke="#9CA3AF" />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1F2937',
                                        border: '1px solid #374151',
                                        borderRadius: '8px'
                                    }}
                                    labelStyle={{ color: '#F3F4F6' }}
                                />
                                <Legend />
                                <Line type="monotone" dataKey="sales" stroke="#8884d8" strokeWidth={2} name="Vendas" />
                                <Line type="monotone" dataKey="revenue" stroke="#82ca9d" strokeWidth={2} name="Receita (R$)" />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Gráfico de produtos por categoria */}
                <Card className="bg-zinc-800 border-gray-700">
                    <CardHeader>
                        <CardTitle className="text-white">Produtos por Categoria</CardTitle>
                        <CardDescription className="text-gray-400">Distribuição do catálogo</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={dashboardData.productsByCategory}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="count"
                                    label={({ category, count }) => `${category}: ${count}`}
                                >
                                    {dashboardData.productsByCategory.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1F2937',
                                        border: '1px solid #374151',
                                        borderRadius: '8px'
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Tabelas de dados */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top produtos */}
                <Card className="bg-zinc-800 border-gray-700">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center">
                            <Star className="h-5 w-5 mr-2 text-yellow-400" />
                            Produtos Mais Vendidos
                        </CardTitle>
                        <CardDescription className="text-gray-400">Top 5 produtos por vendas</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {dashboardData.topProducts.map((product, index) => (
                                <div key={product.id} className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center text-sm font-medium text-white">
                                            {index + 1}
                                        </div>
                                        <div>
                                            <p className="text-white font-medium">{product.name}</p>
                                            <p className="text-gray-400 text-sm">{product.views} visualizações</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-white font-medium">{product.sales} vendas</p>
                                        <p className="text-green-400 text-sm">R$ {product.revenue.toLocaleString()}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Produtos com estoque baixo */}
                <Card className="bg-zinc-800 border-gray-700">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center">
                            <AlertTriangle className="h-5 w-5 mr-2 text-orange-400" />
                            Estoque Baixo
                        </CardTitle>
                        <CardDescription className="text-gray-400">Produtos que precisam de reposição</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {dashboardData.lowStockProducts.map((product) => (
                                <div key={`${product.id}-${product.variant}`} className="flex items-center justify-between">
                                    <div>
                                        <p className="text-white font-medium">{product.name}</p>
                                        <p className="text-gray-400 text-sm">{product.variant}</p>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Badge variant={product.stock <= 1 ? "destructive" : "secondary"} className="text-xs">
                                            {product.stock} em estoque
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {dashboardData.lowStockProducts.length === 0 && (
                            <p className="text-gray-400 text-center py-4">Todos os produtos têm estoque adequado! 🎉</p>
                        )}
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <Card className="bg-zinc-800 border-gray-700">
                    <CardHeader>
                        <CardTitle className="text-white text-sm">Variações de Produto</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{dashboardData.totalVariants}</div>
                        <p className="text-gray-400 text-xs">Média de {(dashboardData.totalVariants / dashboardData.totalProducts).toFixed(1)} por produto</p>
                        <Progress value={(dashboardData.totalVariants / (dashboardData.totalProducts * 5)) * 100} className="mt-2" />
                    </CardContent>
                </Card>

                <Card className="bg-zinc-800 border-gray-700">
                    <CardHeader>
                        <CardTitle className="text-white text-sm">Produtos Disponíveis</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-400">
                            {((dashboardData.availableProducts / dashboardData.totalProducts) * 100).toFixed(1)}%
                        </div>
                        <p className="text-gray-400 text-xs">{dashboardData.availableProducts} de {dashboardData.totalProducts} produtos</p>
                        <Progress value={(dashboardData.availableProducts / dashboardData.totalProducts) * 100} className="mt-2" />
                    </CardContent>
                </Card>

                <Card className="bg-zinc-800 border-gray-700">
                    <CardHeader>
                        <CardTitle className="text-white text-sm">Produtos em Destaque</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-400">{dashboardData.featuredProducts}</div>
                        <p className="text-gray-400 text-xs">{((dashboardData.featuredProducts / dashboardData.totalProducts) * 100).toFixed(1)}% do catálogo</p>
                        <Progress value={(dashboardData.featuredProducts / dashboardData.totalProducts) * 100} className="mt-2" />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AdminDashboard;