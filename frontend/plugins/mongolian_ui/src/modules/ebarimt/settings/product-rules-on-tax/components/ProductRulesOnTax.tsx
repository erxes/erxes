import { Button, Dialog, toast } from 'erxes-ui';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconPlus } from '@tabler/icons-react';
import { useAddProductRulesOnTax } from '@/ebarimt/settings/product-rules-on-tax/hooks/useAddProductRulesOnTax';
import {
  productRulesOnTaxSchema,
  TProductRulesOnTaxForm,
} from '@/ebarimt/settings/product-rules-on-tax/constants/productRulesOnTaxSchema.ts';
import { ProductRulesOnTaxForm } from '@/ebarimt/settings/product-rules-on-tax/components/ProductRulesOnTaxForm';

export const AddProductRulesOnTax = () => {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button>
          <IconPlus />
          Add Rule
        </Button>
      </Dialog.Trigger>
      <Dialog.ContentCombined
        title="Add Rule"
        description="Add a new rule"
        className="sm:max-w-2xl"
      >
        <AddProductRulesOnTaxForm setOpen={setOpen} />
      </Dialog.ContentCombined>
    </Dialog>
  );
};

export const AddProductRulesOnTaxForm = ({
  setOpen,
}: {
  setOpen: (open: boolean) => void;
}) => {
  const form = useForm<TProductRulesOnTaxForm>({
    resolver: zodResolver(productRulesOnTaxSchema),
    defaultValues: {
      title: '',
      productCategoryIds: '',
      excludeCategoryIds: '',
      productIds: '',
      excludeProductIds: '',
      kind: '',
      taxType: '',
      taxCode: '',
      percent: 0,
      tagIds: '',
      excludeTagIds: '',
      status: '',
    },
  });
  const { addProductRulesOnTax, loading } = useAddProductRulesOnTax();

  const onSubmit = (data: TProductRulesOnTaxForm) => {
    const productCategoryIds = data.productCategoryIds
      ? data.productCategoryIds.split(',').map((s) => s.trim())
      : [];
    const excludeCategoryIds = data.excludeCategoryIds
      ? data.excludeCategoryIds.split(',').map((s) => s.trim())
      : [];
    const productIds = data.productIds
      ? data.productIds.split(',').map((s) => s.trim())
      : [];
    const excludeProductIds = data.excludeProductIds
      ? data.excludeProductIds.split(',').map((s) => s.trim())
      : [];
    const tagIds = data.tagIds
      ? data.tagIds.split(',').map((s) => s.trim())
      : [];
    const excludeTagIds = data.excludeTagIds
      ? data.excludeTagIds.split(',').map((s) => s.trim())
      : [];

    const variables: any = {
      title: data.title,
      productCategoryIds,
      excludeCategoryIds,
      productIds,
      excludeProductIds,
      kind: data.kind,
      taxType: data.taxType,
      taxCode: data.taxCode,
      tagIds,
      excludeTagIds,
      status: data.status,
    };

    if (data.kind !== 'ctax') {
      variables.taxPercent = data.percent;
    }

    addProductRulesOnTax({
      variables,
      onCompleted: () => {
        toast({
          title: 'Success',
          description: 'Product rule added successfully',
        });
        setOpen(false);
        form.reset();
      },
      onError: (error: any) => {
        toast({
          title: 'Error',
          description: error.message || 'Failed to add product rule',
          variant: 'destructive',
        });
      },
    });
  };

  return (
    <ProductRulesOnTaxForm form={form} onSubmit={onSubmit} loading={loading} />
  );
};
