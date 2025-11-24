import { Button, Dialog, toast } from 'erxes-ui';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconPlus } from '@tabler/icons-react';
import { useAddProductRulesOnTax } from '@/ebarimt/settings/product-rules-on-tax/hooks/useAddProductRulesOnTax';
import { TaxType } from '@/ebarimt/settings/product-rules-on-tax/constants/productRulesOnTaxDefaultValues';
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
      productCategories: '',
      excludeCategories: '',
      products: '',
      excludeProducts: '',
      kind: TaxType.FREE,
      taxType: 'TAX',
      taxCode: '0',
      percent: 0,
      tags: '',
      excludeTags: '',
      status: '',
    },
  });
  const { addProductRulesOnTax, loading } = useAddProductRulesOnTax();

  const onSubmit = (data: TProductRulesOnTaxForm) => {
    addProductRulesOnTax({
      variables: {
        title: data.title,
        productCategories: data.productCategories,
        excludeCategories: data.excludeCategories,
        products: data.products,
        excludeProducts: data.excludeProducts,
        kind: data.kind,
        taxType: data.taxType,
        taxCode: data.taxCode,
        percent: data.percent,
        tags: data.tags,
        excludeTags: data.excludeTags,
        status: data.status,
      },
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
