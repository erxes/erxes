import { Dialog, isDeeplyEqual, Spinner, useQueryState, toast } from 'erxes-ui';
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
import { EBarimtDialog } from '~/modules/put-response/layout/components/Dialog';

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

  const handleSubmit = (data: TProductGroupForm) => {
    if (!productGroupDetail) return;

    const initialData = {
      mainProductId: productGroupDetail.mainProductId,
      subProductId: productGroupDetail.subProductId,
      sortNum: productGroupDetail.sortNum,
      ratio: productGroupDetail.ratio,
      isActive: productGroupDetail.isActive,
    };

    const newData = { ...initialData, ...data };

    if (isDeeplyEqual(newData, initialData)) {
      toast({
        title: 'Info',
        description: 'No changes were made',
      });
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
    <Dialog
      open={open !== null}
      onOpenChange={(isOpen) => !isOpen && setOpen(null)}
    >
      <EBarimtDialog
        title="Edit Product Group"
        description="Edit a product group"
      >
        <ProductGroupForm
          form={form}
          onSubmit={handleSubmit}
          loading={editLoading || loading}
        />
        {loading && (
          <div className="absolute inset-0 bg-background/10 backdrop-blur-sm flex items-center justify-center rounded-md">
            <Spinner />
          </div>
        )}
      </EBarimtDialog>
    </Dialog>
  );
};
