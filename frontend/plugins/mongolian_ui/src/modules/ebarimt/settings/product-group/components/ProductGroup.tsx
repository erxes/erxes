import { Button, Dialog, toast } from 'erxes-ui';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconPlus } from '@tabler/icons-react';
import {
  productGroupSchema,
  TProductGroupForm,
} from '@/ebarimt/settings/product-group/constants/productGroupSchema';
import { useAddProductGroup } from '@/ebarimt/settings/product-group/hooks/useProductGroup';
import { ProductGroupForm } from '@/ebarimt/settings/product-group/components/ProductGroupForm';

export const AddProductGroup = () => {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button>
          <IconPlus />
          Add Group
        </Button>
      </Dialog.Trigger>
      <Dialog.ContentCombined
        title="Add Group"
        description="Add a new group"
        className="sm:max-w-2xl"
      >
        <AddProductGroupForm setOpen={setOpen} />
      </Dialog.ContentCombined>
    </Dialog>
  );
};

export const AddProductGroupForm = ({
  setOpen,
}: {
  setOpen: (open: boolean) => void;
}) => {
  const form = useForm<TProductGroupForm>({
    resolver: zodResolver(productGroupSchema),
    defaultValues: {
      mainProductId: '',
      subProductId: '',
      isActive: true,
      ratio: 0,
      sortNum: 0,
    },
  });
  const { addProductGroup, loading } = useAddProductGroup();

  const onSubmit = (data: TProductGroupForm) => {
    addProductGroup({
      variables: {
        mainProductId: data.mainProductId,
        subProductId: data.subProductId,
        sortNum: data.sortNum,
        ratio: data.ratio,
        isActive: data.isActive,
      },
      onCompleted: () => {
        toast({
          title: 'Success',
          description: 'Product group created successfully',
        });
        setOpen(false);
        form.reset();
      },
      onError: (error: any) => {
        toast({
          title: 'Error',
          description: error.message || 'Failed to create product group',
          variant: 'destructive',
        });
      },
    });
  };
  return <ProductGroupForm form={form} onSubmit={onSubmit} loading={loading} />;
};
