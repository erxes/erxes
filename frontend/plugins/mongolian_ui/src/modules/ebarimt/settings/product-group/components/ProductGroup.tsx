import { Button, Sheet, Spinner, toast } from 'erxes-ui';
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

const FORM_ID = 'add-product-group-form';

export const AddProductGroup = () => {
  const [open, setOpen] = useState(false);
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

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Sheet.Trigger asChild>
        <Button>
          <IconPlus />
          Add Group
        </Button>
      </Sheet.Trigger>
      <Sheet.View side="right" className="bg-background sm:max-w-2xl">
        <Sheet.Header>
          <Sheet.Title>Add Group</Sheet.Title>
          <Sheet.Close />
        </Sheet.Header>
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <ProductGroupForm
            form={form}
            onSubmit={onSubmit}
            loading={loading}
            isSheet
            formId={FORM_ID}
          />
        </div>
        <Sheet.Footer className="gap-2 border-t bg-background">
          <Sheet.Close asChild>
            <Button variant="outline" size="lg">
              Cancel
            </Button>
          </Sheet.Close>
          <Button type="submit" form={FORM_ID} size="lg" disabled={loading}>
            {loading ? <Spinner /> : 'Save'}
          </Button>
        </Sheet.Footer>
      </Sheet.View>
    </Sheet>
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
