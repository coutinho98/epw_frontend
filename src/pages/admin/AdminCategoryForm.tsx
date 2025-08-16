import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import api from '@/services/api';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Category } from '@/types/Category';

const formSchema = z.object({
    name: z.string().min(1, { message: 'O nome da categoria é obrigatório.' }),
});

type FormValues = z.infer<typeof formSchema>;

interface AdminCategoryFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    categoryToEdit: Category | null;
}

const AdminCategoryForm: React.FC<AdminCategoryFormProps> = ({ isOpen, onClose, onSuccess, categoryToEdit }) => {
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
        },
    });

    useEffect(() => {
        if (categoryToEdit) {
            form.reset({
                name: categoryToEdit.name,
            });
        } else {
            form.reset();
        }
    }, [categoryToEdit, form]);

    const onSubmit = async (values: FormValues) => {
        try {
            if (categoryToEdit) {
                await api.patch(`/categories/${categoryToEdit.id}`, values);
                toast.success('Categoria atualizada com sucesso!');
            } else {
                await api.post('/categories', values);
                toast.success('Categoria adicionada com sucesso!');
            }
            onSuccess();
            onClose();
        } catch (err: any) {
            console.error('Erro ao salvar a categoria:', err);
            toast.error('Falha ao salvar categoria.', { description: err.message || 'Erro desconhecido.' });
        }
    };

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent side="right" className="w-full sm:max-w-md flex flex-col bg-zinc-900 text-white">
                <SheetHeader>
                    <SheetTitle className="text-white">{categoryToEdit ? 'Editar Categoria' : 'Adicionar Nova Categoria'}</SheetTitle>
                    <SheetDescription className="text-gray-300">
                        Preencha o nome da categoria.
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
                                            <Input placeholder="Nome da Categoria" className="text-white bg-zinc-900 border-gray-700" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="flex justify-end space-x-4">
                                <Button type="button" variant="outline" onClick={onClose} className="text-black border-gray-700 hover:bg-gray-200">Cancelar</Button>
                                <Button type="submit" className="bg-white text-black hover:bg-gray-300">{categoryToEdit ? 'Salvar Alterações' : 'Adicionar Categoria'}</Button>
                            </div>
                        </form>
                    </Form>
                </div>
            </SheetContent>
        </Sheet>
    );
};

export default AdminCategoryForm;