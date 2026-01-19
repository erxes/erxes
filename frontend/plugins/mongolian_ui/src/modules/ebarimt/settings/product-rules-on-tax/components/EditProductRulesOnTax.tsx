import { Dialog, isDeeplyEqual, Spinner, useQueryState, toast } from 'erxes-ui';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { ProductRulesOnTaxForm } from './ProductRulesOnTaxForm';

import { EBarimtDialog } from '~/modules/put-response/layout/components/Dialog';
import {
  productRulesOnTaxSchema,
  TProductRulesOnTaxForm,
} from '@/ebarimt/settings/product-rules-on-tax/constants/productRulesOnTaxSchema.ts';
import { useProductRulesOnTaxEdit } from '@/ebarimt/settings/product-rules-on-tax/hooks/useProductRulesOnTaxEdit';
import { useProductRulesOnTaxRowDetail } from '@/ebarimt/settings/product-rules-on-tax/hooks/useProductRulesOnTaxRowDetail';

export const EditProductRulesOnTax = () => {
  const [open, setOpen] = useQueryState<string>('product_rules_on_tax_id');
  const { productRulesOnTaxDetail, closeDetail, loading } =
    useProductRulesOnTaxRowDetail();
  const { editProductRulesOnTaxRow, loading: editLoading } =
    useProductRulesOnTaxEdit();

  const form = useForm<TProductRulesOnTaxForm>({
    resolver: zodResolver(productRulesOnTaxSchema),
    defaultValues: {
      title: '',
      taxType: '',
      taxCode: '',
      kind: '',
      percent: 0,
      productCategoryIds: '',
      excludeCategoryIds: '',
      productIds: '',
      excludeProductIds: '',
      tagIds: '',
      excludeTagIds: '',
      status: '',
    },
  });
  const { reset } = form;

  useEffect(() => {
    if (productRulesOnTaxDetail) {
      const productCategories =
        productRulesOnTaxDetail.productCategoryIds?.join(', ') || '';
      const excludeCategories =
        productRulesOnTaxDetail.excludeCategoryIds?.join(', ') || '';
      const products = productRulesOnTaxDetail.productIds?.join(', ') || '';
      const excludeProducts =
        productRulesOnTaxDetail.excludeProductIds?.join(', ') || '';
      const tags = productRulesOnTaxDetail.tagIds?.join(', ') || '';
      const excludeTags =
        productRulesOnTaxDetail.excludeTagIds?.join(', ') || '';

      reset({
        title: productRulesOnTaxDetail.title || '',
        taxType: productRulesOnTaxDetail.taxType || '',
        taxCode: productRulesOnTaxDetail.taxCode || '',
        kind: productRulesOnTaxDetail.kind || '',
        percent: productRulesOnTaxDetail.taxPercent || 0,
        productCategoryIds: productCategories,
        excludeCategoryIds: excludeCategories,
        productIds: products,
        excludeProductIds: excludeProducts,
        tagIds: tags,
        excludeTagIds: excludeTags,
        status: productRulesOnTaxDetail.status || '',
      });
    }
  }, [productRulesOnTaxDetail, reset]);

  const handleSubmit = (data: TProductRulesOnTaxForm) => {
    if (!productRulesOnTaxDetail) return;

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

    const newData: any = {
      title: data.title,
      taxType: data.taxType,
      taxCode: data.taxCode,
      kind: data.kind,
      productCategoryIds,
      excludeCategoryIds,
      productIds,
      excludeProductIds,
      tagIds,
      excludeTagIds,
    };

    if (data.kind !== 'ctax') {
      newData.taxPercent = data.percent;
    }

    const initialData = {
      title: productRulesOnTaxDetail.title || '',
      taxType: productRulesOnTaxDetail.taxType || '',
      taxCode: productRulesOnTaxDetail.taxCode || '',
      kind: productRulesOnTaxDetail.kind || '',
      taxPercent: productRulesOnTaxDetail.taxPercent || 0,
      productCategoryIds: productRulesOnTaxDetail.productCategoryIds || [],
      excludeCategoryIds: productRulesOnTaxDetail.excludeCategoryIds || [],
      productIds: productRulesOnTaxDetail.productIds || [],
      excludeProductIds: productRulesOnTaxDetail.excludeProductIds || [],
      tagIds: productRulesOnTaxDetail.tagIds || [],
      excludeTagIds: productRulesOnTaxDetail.excludeTagIds || [],
    };

    const comparisonData = { ...newData };
    const comparisonInitial = { ...initialData };

    if (data.kind === 'ctax') {
      delete comparisonData.taxPercent;
      delete comparisonInitial.taxPercent;
    }

    if (isDeeplyEqual(comparisonData, comparisonInitial)) {
      toast({
        title: 'Success',
        description: 'No changes made',
      });
      reset();
      return closeDetail();
    }

    editProductRulesOnTaxRow({
      variables: {
        id: productRulesOnTaxDetail._id,
        ...newData,
        tags: data.tagIds,
        excludeTags: data.excludeTagIds,
        status: data.status,
      },
      onCompleted: () => {
        toast({
          title: 'Success',
          description: 'Product rules on tax updated successfully',
        });
        closeDetail();
        reset();
        setOpen(null);
      },
      onError: (error) => {
        toast({
          title: 'Error',
          description: error.message || 'Failed to update product rules on tax',
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
        title="Edit Product Rules On Tax"
        description="Edit a product rules on tax"
      >
        <ProductRulesOnTaxForm
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
