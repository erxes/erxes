import {
  Sheet,
  isDeeplyEqual,
  Spinner,
  useQueryState,
  toast,
  Button,
} from 'erxes-ui';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { ProductGroupForm } from './ProductGroupForm';
import {
  productGroupSchema,
  TProductGroupForm,
} from '@/ebarimt/settings/product-group/constants/productGroupSchema';
import { useProductGroupRowDetail } from '@/ebarimt/settings/product-group/hooks/useProductGroupRowDetail';
import { useGroupProductRowEdit } from '@/ebarimt/settings/product-group/hooks/useGroupProductRowEdit';

const FORM_ID = 'edit-product-group-form';

export const EditProductGroupRow = () => {
  const [open, setOpen] = useQueryState<string>('product_group_id');
  const { productGroupDetail, closeDetail, loading } =
    useProductGroupRowDetail();
  const { editGroupProductRow, loading: editLoading } =
    useGroupProductRowEdit();

  const form = useForm<TProductGroupForm>({
    resolver: zodResolver(productGroupSchema),
    defaultValues: {
      mainProductId: '',
      subProductId: '',
      sortNum: 0,
      ratio: 0,
      isActive: true,
    },
  });
  const { reset } = form;

  useEffect(() => {
    if (productGroupDetail) {
      reset({
        mainProductId: productGroupDetail.mainProductId || '',
        subProductId: productGroupDetail.subProductId || '',
        sortNum: productGroupDetail.sortNum || 0,
        ratio: productGroupDetail.ratio || 0,
        isActive: productGroupDetail.isActive ?? true,
      });
    }
  }, [productGroupDetail, reset]);

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) setOpen(null);
  };

  const handleSubmit = (data: TProductGroupForm) => {
    if (!productGroupDetail) return;

    const initialData = {
      mainProductId: productGroupDetail.mainProductId,
      subProductId: productGroupDetail.subProductId,
      sortNum: productGroupDetail.sortNum,
      ratio: productGroupDetail.ratio,
      isActive: productGroupDetail.isActive,
    };

    if (isDeeplyEqual({ ...initialData, ...data }, initialData)) {
      toast({ title: 'Info', description: 'No changes were made' });
      reset();
      return closeDetail();
    }

    editGroupProductRow({
      variables: {
        _id: productGroupDetail._id,
        mainProductId: data.mainProductId,
        subProductId: data.subProductId,
        sortNum: data.sortNum,
        ratio: data.ratio,
        isActive: data.isActive,
      },
      onCompleted: () => {
        toast({
          title: 'Success',
          description: 'Product group updated successfully',
        });
        closeDetail();
        reset();
        setOpen(null);
      },
      onError: (error) => {
        toast({
          title: 'Error',
          description: error.message || 'Failed to update product group',
          variant: 'destructive',
        });
      },
    });
  };

  return (
    <Sheet open={open !== null} onOpenChange={handleClose}>
      <Sheet.View side="right" className="bg-background sm:max-w-2xl">
        <Sheet.Header>
          <Sheet.Title>Edit Product Group</Sheet.Title>
          <Sheet.Close />
        </Sheet.Header>
        <div className="flex-1 overflow-y-auto px-5 py-4 relative">
          <ProductGroupForm
            form={form}
            onSubmit={handleSubmit}
            loading={editLoading || loading}
            isSheet
            formId={FORM_ID}
          />
          {loading && (
            <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
              <Spinner />
            </div>
          )}
        </div>
        <Sheet.Footer className="gap-2 border-t bg-background">
          <Sheet.Close asChild>
            <Button variant="outline" size="lg">
              Cancel
            </Button>
          </Sheet.Close>
          <Button
            type="submit"
            form={FORM_ID}
            size="lg"
            disabled={editLoading || loading}
          >
            {editLoading ? <Spinner /> : 'Save'}
          </Button>
        </Sheet.Footer>
      </Sheet.View>
    </Sheet>
  );
};
