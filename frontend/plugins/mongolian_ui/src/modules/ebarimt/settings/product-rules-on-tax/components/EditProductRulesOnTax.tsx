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
import { ProductRulesOnTaxForm } from './ProductRulesOnTaxForm';
import {
  productRulesOnTaxSchema,
  TProductRulesOnTaxForm,
} from '@/ebarimt/settings/product-rules-on-tax/constants/productRulesOnTaxSchema.ts';
import { useProductRulesOnTaxEdit } from '@/ebarimt/settings/product-rules-on-tax/hooks/useProductRulesOnTaxEdit';
import { useProductRulesOnTaxRowDetail } from '@/ebarimt/settings/product-rules-on-tax/hooks/useProductRulesOnTaxRowDetail';

const FORM_ID = 'edit-product-rules-form';

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
      reset({
        title: productRulesOnTaxDetail.title || '',
        taxType: productRulesOnTaxDetail.taxType || '',
        taxCode: productRulesOnTaxDetail.taxCode || '',
        kind: productRulesOnTaxDetail.kind || '',
        percent: productRulesOnTaxDetail.taxPercent || 0,
        productCategoryIds:
          productRulesOnTaxDetail.productCategoryIds?.join(', ') || '',
        excludeCategoryIds:
          productRulesOnTaxDetail.excludeCategoryIds?.join(', ') || '',
        productIds: productRulesOnTaxDetail.productIds?.join(', ') || '',
        excludeProductIds:
          productRulesOnTaxDetail.excludeProductIds?.join(', ') || '',
        tagIds: productRulesOnTaxDetail.tagIds?.join(', ') || '',
        excludeTagIds: productRulesOnTaxDetail.excludeTagIds?.join(', ') || '',
        status: productRulesOnTaxDetail.status || '',
      });
    }
  }, [productRulesOnTaxDetail, reset]);

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) setOpen(null);
  };

  const handleSubmit = (data: TProductRulesOnTaxForm) => {
    if (!productRulesOnTaxDetail) return;

    const toArray = (val: string | undefined) =>
      val ? val.split(',').map((s) => s.trim()) : [];

    const newData: any = {
      title: data.title,
      taxType: data.taxType,
      taxCode: data.taxCode,
      kind: data.kind,
      productCategoryIds: toArray(data.productCategoryIds),
      excludeCategoryIds: toArray(data.excludeCategoryIds),
      productIds: toArray(data.productIds),
      excludeProductIds: toArray(data.excludeProductIds),
      tagIds: toArray(data.tagIds),
      excludeTagIds: toArray(data.excludeTagIds),
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
      toast({ title: 'Success', description: 'No changes made' });
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
    <Sheet open={open !== null} onOpenChange={handleClose}>
      <Sheet.View side="right" className="bg-background sm:max-w-2xl">
        <Sheet.Header>
          <Sheet.Title>Edit Product Rules On Tax</Sheet.Title>
          <Sheet.Close />
        </Sheet.Header>
        <div className="flex-1 overflow-y-auto px-5 py-4 relative">
          <ProductRulesOnTaxForm
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
