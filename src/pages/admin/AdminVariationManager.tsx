import { useState, useEffect, ChangeEvent } from 'react';
import api from '@/services/api';
import { Variant } from '@/types/Variant';
import { Product } from '@/types/Product';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface AdminVariationManagerProps {
    isOpen: boolean;
    onClose: () => void;
    product: Product | null;
    onSuccess: () => void;
}

const AdminVariationManager: React.FC<AdminVariationManagerProps> = ({ isOpen, onClose, product, onSuccess }) => {
    const [variants, setVariants] = useState<Variant[]>([]);
    const [newVariant, setNewVariant] = useState({ size: '', color: '', stock: 0, additionalPrice: 0, sku: '', images: [] as File[] });
    const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
    const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);
    const [editingVariantId, setEditingVariantId] = useState<string | null>(null);

    useEffect(() => {
        if (product) {
            setVariants(product.variants || []);
        } else {
            setVariants([]);
        }
    }, [product]);

    const handleImageFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            setNewVariant(prev => ({ ...prev, images: files }));
            setImagePreviewUrls(files.map(file => URL.createObjectURL(file)));
        }
    };

    const handleEditVariantClick = (variant: Variant) => {
        setEditingVariantId(variant.id);
        setNewVariant({
            size: variant.size,
            color: variant.color,
            stock: variant.stock,
            additionalPrice: variant.additionalPrice,
            sku: variant.sku,
            images: []
        });
        setExistingImageUrls(variant.imageUrls || []);
        setImagePreviewUrls([]); 
    };

    const handleClearForm = () => {
        setEditingVariantId(null);
        setNewVariant({ size: '', color: '', stock: 0, additionalPrice: 0, sku: '', images: [] });
        setExistingImageUrls([]);
        setImagePreviewUrls([]);
    };

    const handleAddOrUpdateVariant = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!product) {
            toast.error('Nenhum produto selecionado.');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('size', newVariant.size);
            formData.append('color', newVariant.color);
            formData.append('stock', newVariant.stock.toString());
            formData.append('additionalPrice', newVariant.additionalPrice.toString());
            formData.append('productId', product.id);
            formData.append('sku', newVariant.sku);
            
            existingImageUrls.forEach(url => {
                formData.append('imageUrls', url);
            });

            newVariant.images.forEach(file => {
                formData.append('images', file);
            });

            if (editingVariantId) {
                await api.patch(`/variants/${editingVariantId}`, formData);
                toast.success('Variação atualizada com sucesso!');
            } else {
                await api.post(`/variants`, formData);
                toast.success('Variação adicionada com sucesso!');
            }
            
            onSuccess();
            handleClearForm();
        } catch (err: any) {
            console.error('Falha ao salvar variação:', err);
            toast.error('Falha ao salvar variação.', { description: err.message || 'Erro desconhecido.' });
        }
    };

    const handleDeleteVariant = async (variantId: string) => {
        try {
            await api.delete(`/variants/${variantId}`);
            toast.success('Variação removida com sucesso!');
            onSuccess();
        } catch (err: any) {
            toast.error('Falha ao remover variação.', { description: err.message || 'Erro desconhecido.' });
        }
    };

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent side="right" className="w-full sm:max-w-xl flex flex-col bg-zinc-900 text-white">
                <SheetHeader>
                    <SheetTitle className="text-white">Gerenciar Variações</SheetTitle>
                    <SheetDescription className="text-gray-300">
                        Produto: {product?.name}
                    </SheetDescription>
                </SheetHeader>
                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    {variants.length > 0 ? (
                        <div className="space-y-2">
                            <h3 className="text-lg font-semibold text-white">Variações Existentes</h3>
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-gray-700">
                                        <TableHead className="text-white">Cor</TableHead>
                                        <TableHead className="text-white">Tamanho</TableHead>
                                        <TableHead className="text-white">SKU</TableHead>
                                        <TableHead className="text-white">Estoque</TableHead>
                                        <TableHead className="text-white">Preço Adicional</TableHead>
                                        <TableHead className="text-white text-right">Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {variants.map((variant) => (
                                        <TableRow key={variant.id} className="border-gray-800 hover:bg-zinc-700">
                                            <TableCell>{variant.color}</TableCell>
                                            <TableCell>{variant.size}</TableCell>
                                            <TableCell>{variant.sku}</TableCell>
                                            <TableCell>{variant.stock}</TableCell>
                                            <TableCell>R$ {variant.additionalPrice.toFixed(2)}</TableCell>
                                            <TableCell className="text-right flex items-center justify-end space-x-2">
                                                <Button variant="outline" size="sm" onClick={() => handleEditVariantClick(variant)} className="text-white border-white hover:bg-white hover:text-black">
                                                    Editar
                                                </Button>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="destructive" size="sm">Remover</Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent className="text-white bg-zinc-800">
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle className="text-white">Tem certeza?</AlertDialogTitle>
                                                            <AlertDialogDescription className="text-gray-300">
                                                                Esta ação não pode ser desfeita.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel className="text-white border-gray-500 hover:bg-gray-700">Cancelar</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleDeleteVariant(variant.id)} className="bg-red-600 hover:bg-red-700 text-white">
                                                                Remover
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <p className="mt-4 text-gray-400">Este produto não possui variações.</p>
                    )}
                    
                    <div className="mt-6">
                        <h3 className="text-lg font-semibold text-white mb-4">
                            {editingVariantId ? 'Editar Variação' : 'Adicionar Nova Variação'}
                        </h3>
                        <form onSubmit={handleAddOrUpdateVariant} className="space-y-4">
                            <div>
                                <Label htmlFor="size" className="text-white">Tamanho</Label>
                                <Input id="size" value={newVariant.size} onChange={e => setNewVariant({...newVariant, size: e.target.value})} className="text-white bg-zinc-900 border-gray-700" required />
                            </div>
                            <div>
                                <Label htmlFor="color" className="text-white">Cor</Label>
                                <Input id="color" value={newVariant.color} onChange={e => setNewVariant({...newVariant, color: e.target.value})} className="text-white bg-zinc-900 border-gray-700" required />
                            </div>
                            <div>
                                <Label htmlFor="sku" className="text-white">SKU</Label>
                                <Input id="sku" value={newVariant.sku} onChange={e => setNewVariant({...newVariant, sku: e.target.value})} className="text-white bg-zinc-900 border-gray-700" required />
                            </div>
                            <div>
                                <Label htmlFor="stock" className="text-white">Estoque</Label>
                                <Input id="stock" type="number" value={newVariant.stock} onChange={e => setNewVariant({...newVariant, stock: parseInt(e.target.value) || 0})} className="text-white bg-zinc-900 border-gray-700" required />
                            </div>
                            <div>
                                <Label htmlFor="additionalPrice" className="text-white">Preço Adicional</Label>
                                <Input id="additionalPrice" type="number" value={newVariant.additionalPrice} onChange={e => setNewVariant({...newVariant, additionalPrice: parseFloat(e.target.value) || 0})} step="0.01" className="text-white bg-zinc-900 border-gray-700" required />
                            </div>
                            <div>
                                <Label htmlFor="images" className="text-white">Imagens (arquivos)</Label>
                                <Input
                                    id="images"
                                    type="file"
                                    multiple
                                    onChange={handleImageFileChange}
                                    className="text-white bg-zinc-900 border-gray-700 file:text-white file:bg-gray-700 hover:file:bg-gray-600"
                                />
                            </div>
                            <div className="mt-2 flex space-x-2 overflow-x-auto">
                                {existingImageUrls.map((url, index) => (
                                    <div key={`existing-${index}`} className="w-24 h-24 border rounded-md overflow-hidden flex-shrink-0">
                                        <img src={url} alt={`Preview ${index + 1}`} className="object-cover w-full h-full" />
                                    </div>
                                ))}
                                {imagePreviewUrls.map((url, index) => (
                                    <div key={`new-${index}`} className="w-24 h-24 border rounded-md overflow-hidden flex-shrink-0">
                                        <img src={url} alt={`Nova imagem ${index + 1}`} className="object-cover w-full h-full" />
                                    </div>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                {editingVariantId && (
                                    <Button type="button" onClick={handleClearForm} variant="outline" className="w-full bg-transparent text-white hover:bg-gray-700 border-gray-700">
                                        Cancelar
                                    </Button>
                                )}
                                <Button type="submit" className="w-full bg-white text-black hover:bg-gray-300">
                                    {editingVariantId ? 'Salvar Variação' : 'Adicionar Variação'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
};

export default AdminVariationManager;