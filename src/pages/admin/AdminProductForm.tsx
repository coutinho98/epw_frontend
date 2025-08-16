import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import api from '@/services/api';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Product } from '@/types/Product';
import { Category } from '@/types/Category';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

const formSchema = z.object({
    name: z.string().min(1, { message: 'O nome é obrigatório.' }),
    description: z.string().nullable().optional(),
    details: z.string().nullable().optional(),
    slug: z.string().min(1, { message: 'O slug é obrigatório.' }),
    price: z.number().min(0, { message: 'O preço deve ser um valor positivo.' }),
    images: z.any().optional(),
    isFeatured: z.boolean(),
    isAvailable: z.boolean(),
    categoryId: z.string().uuid({ message: 'A categoria é obrigatória.' }).nullable(),
});

type FormValues = z.infer<typeof formSchema>;

interface AdminProductFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    productToEdit: Product | null;
}

const AdminProductForm: React.FC<AdminProductFormProps> = ({ isOpen, onClose, onSuccess, productToEdit }) => {
    const [imagePreview, setImagePreview] = useState<string[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            description: null,
            details: null,
            slug: '',
            price: 0,
            images: undefined,
            isFeatured: false,
            isAvailable: true,
            categoryId: null,
        },
    });

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await api.get<Category[]>('/categories');
                setCategories(response);
            } catch (err) {
                console.error("Falha ao buscar categorias:", err);
                toast.error('Falha ao carregar categorias.');
            }
        };

        fetchCategories();
    }, []);

    useEffect(() => {
        if (productToEdit) {
            const detailsFromProduct = (productToEdit as any).details;
            form.reset({
                name: productToEdit.name,
                description: productToEdit.description || null,
                details: Array.isArray(detailsFromProduct) ? detailsFromProduct.join('\n') : null,
                slug: productToEdit.slug,
                price: productToEdit.price,
                images: undefined,
                isFeatured: productToEdit.isFeatured,
                isAvailable: productToEdit.isAvailable,
                categoryId: productToEdit.categoryId,
            });
            if (productToEdit.mainImageUrl && productToEdit.mainImageUrl.length > 0) {
                setImagePreview(productToEdit.mainImageUrl);
            }
        } else {
            form.reset();
            setImagePreview([]);
        }
    }, [productToEdit, form]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            form.setValue('images', files);
            const urls = files.map(file => URL.createObjectURL(file));
            setImagePreview(urls);
        }
    };

    const onSubmit = async (values: FormValues) => {
        try {
            const productData = {
                name: values.name,
                description: values.description || undefined,
                details: values.details ? values.details.split('\n').map(item => item.trim()).filter(item => item !== '') : undefined,
                slug: values.slug,
                price: values.price,
                isFeatured: values.isFeatured,
                isAvailable: values.isAvailable,
                categoryId: values.categoryId || undefined,
            };

            if (productToEdit) {
                await api.patch(`/products/${productToEdit.id}`, productData);
                toast.success('Produto atualizado com sucesso!');
            } else {
                await api.post('/products', productData);
                toast.success('Produto adicionado com sucesso!');
            }
            onSuccess();
            onClose();
        } catch (err: any) {
            console.error('Erro ao salvar o produto:', err);
            toast.error('Falha ao salvar produto.', { description: err.message || 'Erro desconhecido.' });
        }
    };

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent side="right" className="w-full sm:max-w-md flex flex-col bg-zinc-900 text-white">
                <SheetHeader>
                    <SheetTitle className="text-white">{productToEdit ? 'Editar Produto' : 'Adicionar Novo Produto'}</SheetTitle>
                    <SheetDescription className="text-gray-300">
                        Preencha os detalhes do produto.
                    </SheetDescription>
                </SheetHeader>
                <div className="flex-1 overflow-y-auto p-4">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nome</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Nome do Produto" className="text-white bg-zinc-900 border-gray-700" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="categoryId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Categoria</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value || undefined}>
                                            <FormControl>
                                                <SelectTrigger className="text-white bg-zinc-900 border-gray-700">
                                                    <SelectValue placeholder="Selecione uma categoria" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="text-white bg-zinc-900 border-gray-700">
                                                {categories.map(category => (
                                                    <SelectItem key={category.id} value={category.id}>
                                                        {category.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Descrição</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="Descrição do Produto" className="text-white bg-zinc-900 border-gray-700" {...field} value={field.value || ''} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="details"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Detalhes (um por linha)</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="95% cotton\n5% poliester" className="text-white bg-zinc-900 border-gray-700" {...field} value={field.value || ''} />
                                        </FormControl>
                                        <FormDescription>
                                            Adicione cada detalhe em uma nova linha.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="slug"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Slug</FormLabel>
                                        <FormControl>
                                            <Input placeholder="slug-do-produto" className="text-white bg-zinc-900 border-gray-700" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="price"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Preço</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="0.00" className="text-white bg-zinc-900 border-gray-700" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="isFeatured"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-4">
                                        <FormControl>
                                            <Checkbox checked={field.value} onCheckedChange={field.onChange} className="text-white border-white" />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel>Produto em Destaque</FormLabel>
                                            <FormDescription className="text-gray-400">Marque para destacar o produto na página inicial.</FormDescription>
                                        </div>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="isAvailable"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-4">
                                        <FormControl>
                                            <Checkbox checked={field.value} onCheckedChange={field.onChange} className="text-white border-white" />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel>Disponível</FormLabel>
                                            <FormDescription className="text-gray-400">Marque se o produto estiver disponível para compra.</FormDescription>
                                        </div>
                                    </FormItem>
                                )}
                            />
                            <div className="flex justify-end space-x-4">
                                <Button type="button" variant="outline" onClick={onClose} className="text-black border-gray-700 hover:bg-gray-200">Cancelar</Button>
                                <Button type="submit" className="bg-white text-black hover:bg-gray-300">{productToEdit ? 'Salvar Alterações' : 'Adicionar Produto'}</Button>
                            </div>
                        </form>
                    </Form>
                </div>
            </SheetContent>
        </Sheet>
    );
};

export default AdminProductForm;