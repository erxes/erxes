import { Button, Sheet, Spinner, toast } from 'erxes-ui';
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

const FORM_ID = 'add-product-rules-form';

export const AddProductRulesOnTax = () => {
  const [open, setOpen] = useState(false);
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
    const toArray = (val: string | undefined) =>
      val ? val.split(',').map((s) => s.trim()) : [];

    const variables: any = {
      title: data.title,
      productCategoryIds: toArray(data.productCategoryIds),
      excludeCategoryIds: toArray(data.excludeCategoryIds),
      productIds: toArray(data.productIds),
      excludeProductIds: toArray(data.excludeProductIds),
      kind: data.kind,
      tagIds: toArray(data.tagIds),
      excludeTagIds: toArray(data.excludeTagIds),
      status: data.status,
    };

    if (data.kind !== 'ctax') {
      variables.taxType = data.taxType;
      variables.taxCode = data.taxCode;
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
    <Sheet open={open} onOpenChange={setOpen}>
      <Sheet.Trigger asChild>
        <Button>
          <IconPlus />
          Add Rule
        </Button>
      </Sheet.Trigger>
      <Sheet.View side="right" className="bg-background sm:max-w-2xl">
        <Sheet.Header>
          <Sheet.Title>Add Rule</Sheet.Title>
          <Sheet.Close />
        </Sheet.Header>
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <ProductRulesOnTaxForm
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
    const toArray = (val: string | undefined) =>
      val ? val.split(',').map((s) => s.trim()) : [];

    const variables: any = {
      title: data.title,
      productCategoryIds: toArray(data.productCategoryIds),
      excludeCategoryIds: toArray(data.excludeCategoryIds),
      productIds: toArray(data.productIds),
      excludeProductIds: toArray(data.excludeProductIds),
      kind: data.kind,
      tagIds: toArray(data.tagIds),
      excludeTagIds: toArray(data.excludeTagIds),
      status: data.status,
    };

    if (data.kind !== 'ctax') {
      variables.taxType = data.taxType;
      variables.taxCode = data.taxCode;
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
