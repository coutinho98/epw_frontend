// src/pages/admin/AdminProductListPage.tsx
import React, { useState, useEffect } from 'react';
import api from '@/services/api';
import { Product, CreateProductDto } from '@/types/Product';
import { Variant } from '@/types/Variant';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
    getSortedRowModel,
    SortingState,
    getFilteredRowModel,
} from "@tanstack/react-table";
import { ArrowUpDown } from 'lucide-react'; // Ícones para ordenação
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'; // Componentes para a tela lateral


interface ProductWithVariants extends Product {
    variants: Variant[];
}

const AdminProductListPage: React.FC = () => {
    const [products, setProducts] = useState<ProductWithVariants[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<ProductWithVariants | null>(null);

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [slug, setSlug] = useState('');
    const [price, setPrice] = useState<number>(0);
    const [mainImageUrl, setMainImageUrl] = useState('');
    const [isFeatured, setIsFeatured] = useState(false);
    const [isAvailable, setIsAvailable] = useState(true);
    const [size, setSize] = useState('');
    const [color, setColor] = useState('');

    const [sorting, setSorting] = useState<SortingState>([]);
    const [globalFilter, setGlobalFilter] = useState('');

    const [isVariationSheetOpen, setIsVariationSheetOpen] = useState(false);
    const [selectedProductForVariations, setSelectedProductForVariations] = useState<ProductWithVariants | null>(null);

    useEffect(() => {
        fetchProducts();
    }, []);

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

    const resetForm = () => {
        setName('');
        setDescription('');
        setSlug('');
        setPrice(0);
        setMainImageUrl('');
        setIsFeatured(false);
        setIsAvailable(true);
        setSize('');
        setColor('');
        setEditingProduct(null);
        setIsFormOpen(false);
    };

    const handleAddProductClick = () => {
        resetForm();
        setIsFormOpen(true);
    };

    const handleEditProductClick = (product: ProductWithVariants) => {
        setEditingProduct(product);
        setName(product.name);
        setDescription(product.description || '');
        setSlug(product.slug);
        setPrice(product.price);
        const imageUrlToEdit = (product.mainImageUrl && product.mainImageUrl.length > 0)
            ? product.mainImageUrl[0]
            : (product.variants && product.variants.length > 0 && product.variants[0].imageUrls && product.variants[0].imageUrls.length > 0)
                ? product.variants[0].imageUrls[0]
                : '';
        setMainImageUrl(imageUrlToEdit);
        setIsFeatured(product.isFeatured);
        setIsAvailable(product.isAvailable);
        setSize(product.size || '');
        setColor(product.color || '');
        setIsFormOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const productData: CreateProductDto = {
            name,
            description,
            slug,
            price,
            isFeatured,
            isAvailable,
        };

        try {
            if (editingProduct) {
                await api.patch(`/products/${editingProduct.id}`, productData);
                toast.success('Produto atualizado com sucesso!');
            } else {
                await api.post('/products', productData);
                toast.success('Produto adicionado com sucesso!');
            }
            fetchProducts();
            resetForm();
        } catch (err: any) {
            toast.error('Falha ao salvar produto.', { description: err.message || 'Erro desconhecido.' });
        }
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
                let imageUrl = row.original.mainImageUrl && row.original.mainImageUrl.length > 0
                    ? row.original.mainImageUrl[0]
                    : '';

                if (!imageUrl && row.original.variants && row.original.variants.length > 0) {
                    const firstVariant = row.original.variants[0];
                    if (firstVariant.imageUrls && firstVariant.imageUrls.length > 0) {
                        imageUrl = firstVariant.imageUrls[0];
                    }
                }

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
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                        className="text-white hover:text-gray-300" 
                    >
                        Nome
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                );
            },
            cell: ({ row }) => <span className="text-white">{row.getValue("name") as string}</span>,
        },
        {
            accessorKey: "price",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                        className="text-white hover:text-gray-300" 
                    >
                        Preço
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                );
            },
            cell: ({ row }) => {
                const price = parseFloat(row.getValue("price"));
                const formatted = new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                }).format(price);
                return <div className="font-medium text-white">{formatted}</div>;
            },
        },
        {
            accessorKey: "size",
            header: () => <div className="text-white">Tamanho Base</div>, 
            cell: ({ row }) => <span className="text-white">{row.getValue("size") as string || 'N/A'}</span>, 
        },
        {
            accessorKey: "color",
            header: () => <div className="text-white">Cor Base</div>, 
            cell: ({ row }) => <span className="text-white">{row.getValue("color") as string || 'N/A'}</span>, 
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
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditProductClick(product)}
                            className="text-white border-white hover:bg-white hover:text-black w-full" 
                        >
                            Editar
                        </Button>
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleManageVariationsClick(product)}
                            className="text-black bg-gray-300 hover:bg-gray-400 w-full"
                        >
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
                <Button onClick={handleAddProductClick} className="bg-white text-black hover:bg-gray-300">
                    {isFormOpen ? 'Esconder Formulário' : 'Adicionar Novo Produto'}
                </Button>
                <Input
                    placeholder="Buscar produtos..."
                    value={globalFilter ?? ""}
                    onChange={(event) => setGlobalFilter(event.target.value)}
                    className="max-w-sm text-white border-gray-700 bg-zinc-900 placeholder-gray-500" 
                />
            </div>

            {isFormOpen && (
                <div className="mb-8 p-6 border rounded-lg shadow-lg bg-zinc-800">
                    <h2 className="text-2xl font-bold mb-4">{editingProduct ? 'Editar Produto' : 'Adicionar Produto'}</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="name" className="text-white">Nome</Label>
                            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required className="text-white bg-zinc-900 border-gray-700 placeholder-gray-500" />
                        </div>
                        <div>
                            <Label htmlFor="description" className="text-white">Descrição</Label>
                            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="text-white bg-zinc-900 border-gray-700 placeholder-gray-500" />
                        </div>
                        <div>
                            <Label htmlFor="slug" className="text-white">Slug</Label>
                            <Input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} required className="text-white bg-zinc-900 border-gray-700 placeholder-gray-500" />
                        </div>
                        <div>
                            <Label htmlFor="price" className="text-white">Preço</Label>
                            <Input id="price" type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} required step="0.01" className="text-white bg-zinc-900 border-gray-700 placeholder-gray-500" />
                        </div>
                        <div>
                            <Label htmlFor="mainImageUrl" className="text-white">URL da Imagem Principal</Label>
                            <Input id="mainImageUrl" value={mainImageUrl} onChange={(e) => setMainImageUrl(e.target.value)} required className="text-white bg-zinc-900 border-gray-700 placeholder-gray-500" />
                            {mainImageUrl && (
                                <div className="mt-2 w-32 h-32 border rounded-md overflow-hidden flex items-center justify-center bg-gray-900">
                                    <img src={mainImageUrl} alt="Preview da Imagem" className="object-cover w-full h-full" />
                                </div>
                            )}
                        </div>
                        <div>
                            <Label htmlFor="size" className="text-white">Tamanho (Ex: P, M, G)</Label>
                            <Input id="size" value={size} onChange={(e) => setSize(e.target.value)} className="text-white bg-zinc-900 border-gray-700 placeholder-gray-500" />
                        </div>
                        <div>
                            <Label htmlFor="color" className="text-white">Cor (Ex: Vermelho, Azul)</Label>
                            <Input id="color" value={color} onChange={(e) => setColor(e.target.value)} className="text-white bg-zinc-900 border-gray-700 placeholder-gray-500" />
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox id="isFeatured" checked={isFeatured} onCheckedChange={(checked: boolean) => setIsFeatured(checked)} className="text-white border-white" />
                            <Label htmlFor="isFeatured" className="text-white">Produto em Destaque</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox id="isAvailable" checked={isAvailable} onCheckedChange={(checked: boolean) => setIsAvailable(checked)} className="text-white border-white" />
                            <Label htmlFor="isAvailable" className="text-white">Disponível</Label>
                        </div>
                        <div className="flex justify-end space-x-4">
                            <Button type="button" variant="outline" onClick={resetForm} className="text-white border-gray-700 hover:bg-gray-700">
                                Cancelar
                            </Button>
                            <Button type="submit" className="bg-white text-black hover:bg-gray-300">
                                {editingProduct ? 'Salvar Alterações' : 'Adicionar Produto'}
                            </Button>
                        </div>
                    </form>
                </div>
            )}

            <div className="rounded-md border border-gray-700"> 
                <Table className="text-white"> 
                    <TableHeader className="bg-zinc-800"> 
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className="border-gray-700"> 
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id} className="text-white">
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                    className="border-gray-800 hover:bg-zinc-700" 
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} className="text-white"> 
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center text-white">
                                    Nenhum resultado encontrado.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                    <TableCaption className="text-gray-400 mt-4">Uma lista dos produtos da loja.</TableCaption>
                </Table>
            </div>

            {/* Sheet para Gerenciar Variações */}
            <Sheet open={isVariationSheetOpen} onOpenChange={setIsVariationSheetOpen}>
                <SheetContent side="right" className="w-full sm:max-w-md flex flex-col bg-zinc-900 text-white">
                    <SheetHeader>
                        <SheetTitle className="text-white">Gerenciar Variações</SheetTitle>
                        <SheetDescription className="text-gray-300">
                            Produto: {selectedProductForVariations?.name}
                        </SheetDescription>
                    </SheetHeader>
                    <div className="flex-1 overflow-y-auto p-4">
                        <p className="text-white">
                            Implementar formulário e lista para variações de {selectedProductForVariations?.name}.
                        </p>
                        {selectedProductForVariations?.variants && selectedProductForVariations.variants.length > 0 ? (
                            <div className="mt-4 space-y-2">
                                <h3 className="text-lg font-semibold text-white">Variações Existentes:</h3>
                                {selectedProductForVariations.variants.map((variant) => (
                                    <div key={variant.id} className="p-2 border border-gray-700 rounded-md text-white">
                                        <p>Cor: {variant.color}, Tamanho: {variant.size}</p>
                                        <p>Estoque: {variant.stock}, Preço Adicional: R$ {variant.additionalPrice.toFixed(2)}</p>
                                        {variant.imageUrls && variant.imageUrls.length > 0 && (
                                            <img src={variant.imageUrls[0]} alt="Variação" className="w-16 h-16 object-cover mt-2 rounded-md" />
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="mt-4 text-gray-400">Este produto não possui variações.</p>
                        )}
                        <div className="mt-6">
                            <h3 className="text-lg font-semibold text-white">Adicionar Nova Variação:</h3>
                            <p className="text-gray-400">Formulário para adicionar novas variações.</p>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    );
};

export default AdminProductListPage;