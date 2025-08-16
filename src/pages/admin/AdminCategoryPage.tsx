import { useState, useEffect } from 'react';
import api from '@/services/api';
import { Category } from '@/types/Category';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import AdminCategoryForm from './AdminCategoryForm';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
    getFilteredRowModel,
} from "@tanstack/react-table";

const AdminCategoryPage: React.FC = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [globalFilter, setGlobalFilter] = useState('');

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const response = await api.get<Category[]>('/categories');
            setCategories(response);
        } catch (err: any) {
            setError(err.message || 'Falha ao carregar as categorias.');
            toast.error('Falha ao carregar as categorias.', { description: err.message || 'Erro desconhecido.' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleEditCategoryClick = (category: Category) => {
        setEditingCategory(category);
        setIsFormOpen(true);
    };

    const handleDeleteCategory = async (categoryId: string) => {
        try {
            await api.delete(`/categories/${categoryId}`);
            toast.success('Categoria removida com sucesso!');
            fetchCategories();
        } catch (err: any) {
            toast.error('Falha ao remover categoria.', { description: err.message || 'Erro desconhecido.' });
        }
    };

    const columns: ColumnDef<Category>[] = [
        {
            accessorKey: "name",
            header: () => <div className="text-white">Nome</div>,
            cell: ({ row }) => <span className="text-white">{row.getValue("name") as string}</span>,
        },
        {
            id: "actions",
            enableHiding: false,
            header: () => <div className="text-right text-white">Ações</div>,
            cell: ({ row }) => {
                const category = row.original;
                return (
                    <div className="flex items-center justify-end space-x-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditCategoryClick(category)}
                            className="text-white hover:bg-gray-700"
                            title="Editar"
                        >
                            <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-white hover:bg-gray-700" title="Remover">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="text-white bg-zinc-800">
                                <AlertDialogHeader>
                                    <AlertDialogTitle className="text-white">Você tem certeza?</AlertDialogTitle>
                                    <AlertDialogDescription className="text-gray-300">
                                        Esta ação não pode ser desfeita. Isso removerá permanentemente a categoria
                                        "{category.name}" do seu banco de dados.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel className="text-white border-gray-500 hover:bg-gray-700">Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteCategory(category.id)} className="bg-red-600 hover:bg-red-700 text-white">
                                        Remover
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                );
            },
        },
    ];

    const table = useReactTable({
        data: categories,
        columns,
        getCoreRowModel: getCoreRowModel(),
        state: {
            globalFilter,
        },
        onGlobalFilterChange: setGlobalFilter,
        getFilteredRowModel: getFilteredRowModel(),
    });


    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen text-white">
                <p>Carregando categorias...</p>
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

    return (
        <div className="p-4 text-white">
            <h1 className="text-3xl font-bold mb-6">Gerenciar Categorias</h1>
            <div className="flex items-center justify-between mb-4">
                <Button onClick={() => { setEditingCategory(null); setIsFormOpen(true); }} className="bg-white text-black hover:bg-gray-300">
                    <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Nova Categoria
                </Button>
                <Input
                    placeholder="Buscar categorias..."
                    value={globalFilter ?? ""}
                    onChange={(event) => setGlobalFilter(event.target.value)}
                    className="max-w-sm text-white border-gray-700 bg-zinc-900 placeholder-gray-500"
                />
            </div>

            <AdminCategoryForm
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSuccess={fetchCategories}
                categoryToEdit={editingCategory}
            />

            <div className="rounded-md border border-gray-700">
                <Table className="text-white">
                    <TableHeader className="bg-zinc-800">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className="border-gray-700">
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id} className="text-white">
                                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"} className="border-gray-800 hover:bg-zinc-700">
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} className="text-white p-2">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow><TableCell colSpan={columns.length} className="h-24 text-center text-white">Nenhuma categoria encontrada.</TableCell></TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};

export default AdminCategoryPage;