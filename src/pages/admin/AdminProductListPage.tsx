import { useState, useEffect } from 'react';
import api from '@/services/api';
import { Product } from '@/types/Product';
import { Variant } from '@/types/Variant';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from '@/components/ui/table';
import { toast } from 'sonner';
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
    getSortedRowModel,
    SortingState,
    getFilteredRowModel,
} from "@tanstack/react-table";
import { ArrowUpDown } from 'lucide-react';
import AdminProductForm from './AdminProductForm';
import AdminVariationManager from './AdminVariationManager';

interface ProductWithVariants extends Product {
    variants: Variant[];
}

const AdminProductListPage: React.FC = () => {
    const [products, setProducts] = useState<ProductWithVariants[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isProductFormOpen, setIsProductFormOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<ProductWithVariants | null>(null);
    const [isVariationSheetOpen, setIsVariationSheetOpen] = useState(false);
    const [selectedProductForVariations, setSelectedProductForVariations] = useState<ProductWithVariants | null>(null);
    const [sorting, setSorting] = useState<SortingState>([]);
    const [globalFilter, setGlobalFilter] = useState('');

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const productsResponse = await api.get<Product[]>(`/products`);
            const productsWithVariants = await Promise.all(
                productsResponse.map(async (product) => {
                    const variantsResponse = await api.get<Variant[]>(`/variants/product/${product.id}`);
                    return {
                        ...product,
                        variants: variantsResponse,
                    };
                })
            );
            setProducts(productsWithVariants);
        } catch (err: any) {
            setError(err.message || 'Falha ao carregar os produtos.');
            toast.error('Falha ao carregar os produtos.', { description: err.message || 'Erro desconhecido.' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleEditProductClick = (product: ProductWithVariants) => {
        setEditingProduct(product);
        setIsProductFormOpen(true);
    };

    const handleDeleteProduct = async (productId: string) => {
        try {
            await api.delete(`/products/${productId}`);
            toast.success('Produto removido com sucesso!');
            fetchProducts();
        } catch (err: any) {
            toast.error('Falha ao remover produto.', { description: err.message || 'Erro desconhecido.' });
        }
    };

    const handleManageVariationsClick = (product: ProductWithVariants) => {
        setSelectedProductForVariations(product);
        setIsVariationSheetOpen(true);
    };

    const columns: ColumnDef<ProductWithVariants>[] = [
        {
            accessorKey: "image",
            header: "Imagem",
            cell: ({ row }) => {
                let imageUrl = row.original.mainImageUrl?.[0] || row.original.variants?.[0]?.imageUrls?.[0] || '';
                return imageUrl ? (
                    <img src={imageUrl} alt={row.original.name} className="w-12 h-12 object-cover rounded-md" />
                ) : (
                    <div className="w-12 h-12 bg-gray-700 flex items-center justify-center text-xs rounded-md text-white">
                        Sem Imagem
                    </div>
                );
            },
            enableSorting: false,
            enableColumnFilter: false,
        },
        {
            accessorKey: "name",
            header: ({ column }) => (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="text-white hover:text-gray-300">
                    Nome
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => <span className="text-white">{row.getValue("name") as string}</span>,
        },
        {
            accessorKey: "price",
            header: ({ column }) => (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="text-white hover:text-gray-300">
                    Preço
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => {
                const price = parseFloat(row.getValue("price"));
                return <div className="font-medium text-white">{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(price)}</div>;
            },
        },
        {
            accessorKey: "isFeatured",
            header: () => <div className="text-white">Em Destaque</div>,
            cell: ({ row }) => <span className="text-white">{row.getValue("isFeatured") ? 'Sim' : 'Não'}</span>,
        },
        {
            accessorKey: "isAvailable",
            header: () => <div className="text-white">Disponível</div>,
            cell: ({ row }) => <span className="text-white">{row.getValue("isAvailable") ? 'Sim' : 'Não'}</span>,
        },
        {
            id: "actions",
            enableHiding: false,
            header: () => <div className="text-right text-white">Ações</div>,
            cell: ({ row }) => {
                const product = row.original;
                return (
                    <div className="flex flex-col space-y-2 items-end">
                        <Button variant="outline" size="sm" onClick={() => handleEditProductClick(product)} className="text-white border-white hover:bg-white hover:text-black w-full">
                            Editar
                        </Button>
                        <Button variant="secondary" size="sm" onClick={() => handleManageVariationsClick(product)} className="text-black bg-gray-300 hover:bg-gray-400 w-full">
                            Gerenciar Variações
                        </Button>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm" className="w-full">
                                    Remover
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="text-white bg-zinc-800">
                                <AlertDialogHeader>
                                    <AlertDialogTitle className="text-white">Você tem certeza?</AlertDialogTitle>
                                    <AlertDialogDescription className="text-gray-300">
                                        Esta ação não pode ser desfeita. Isso removerá permanentemente o produto
                                        "{product.name}" do seu banco de dados.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel className="text-white border-gray-500 hover:bg-gray-700">Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteProduct(product.id)} className="bg-red-600 hover:bg-red-700 text-white">
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
        data: products,
        columns,
        getCoreRowModel: getCoreRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        state: {
            sorting,
            globalFilter,
        },
        onGlobalFilterChange: setGlobalFilter,
        getFilteredRowModel: getFilteredRowModel(),
    });

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen text-white">
                <p>Carregando produtos...</p>
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
        <div className="container mx-auto p-4 text-white">
            <h1 className="text-3xl font-bold mb-6">Gerenciar Produtos</h1>
            <div className="flex items-center justify-between mb-4">
                <Button onClick={() => { setEditingProduct(null); setIsProductFormOpen(true); }} className="bg-white text-black hover:bg-gray-300">
                    Adicionar Novo Produto
                </Button>
                <Input
                    placeholder="Buscar produtos..."
                    value={globalFilter ?? ""}
                    onChange={(event) => setGlobalFilter(event.target.value)}
                    className="max-w-sm text-white border-gray-700 bg-zinc-900 placeholder-gray-500"
                />
            </div>

            <AdminProductForm
                isOpen={isProductFormOpen}
                onClose={() => setIsProductFormOpen(false)}
                onSuccess={fetchProducts}
                productToEdit={editingProduct}
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
                                        <TableCell key={cell.id} className="text-white">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow><TableCell colSpan={columns.length} className="h-24 text-center text-white">Nenhum resultado encontrado.</TableCell></TableRow>
                        )}
                    </TableBody>
                    <TableCaption className="text-gray-400 mt-4">Uma lista dos produtos da loja.</TableCaption>
                </Table>
            </div>

            <AdminVariationManager
                isOpen={isVariationSheetOpen}
                onClose={() => setIsVariationSheetOpen(false)}
                product={selectedProductForVariations}
                onSuccess={fetchProducts}
            />
        </div>
    );
};

export default AdminProductListPage;