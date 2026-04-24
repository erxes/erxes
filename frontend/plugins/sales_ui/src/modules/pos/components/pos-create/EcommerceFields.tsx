import { Form, Label } from 'erxes-ui';
import { useState, useEffect, useCallback, type MutableRefObject } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { PosFormData } from '@/pos/components/pos-create/PosCreate';
import { SelectBranches, SelectProduct } from 'ui-modules';
import { SelectCategory } from '@/pos/hooks/SelectCategory';
import { SelectPayment } from '@/pos/components/payment/SelectPayment';
import { ProductGroup } from '@/pos/pos-detail/types/IPos';
import { MoreOptionsButton } from '@/pos/components/MoreOptionsButton';
import { nanoid } from 'nanoid';

interface EcommerceFieldsProps {
  form: UseFormReturn<PosFormData>;
  productGroupsRef: MutableRefObject<ProductGroup[]>;
}

export const EcommerceFields = ({
  form,
  productGroupsRef,
}: EcommerceFieldsProps) => {
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [excludedCategoryIds, setExcludedCategoryIds] = useState<string[]>([]);
  const [excludedProductIds, setExcludedProductIds] = useState<string[]>([]);
  const [showMore, setShowMore] = useState(false);

  const toggleMore = useCallback(() => setShowMore((prev) => !prev), []);

  const handleCategorySelect = useCallback((value: string | string[]) => {
    setCategoryIds(Array.isArray(value) ? value : value ? [value] : []);
  }, []);

  const handleExcludeCategorySelect = useCallback(
    (value: string | string[]) => {
      setExcludedCategoryIds(
        Array.isArray(value) ? value : value ? [value] : [],
      );
    },
    [],
  );

  const handleExcludeProductsChange = useCallback(
    (value: string | string[]) => {
      setExcludedProductIds(Array.isArray(value) ? value : [value]);
    },
    [],
  );

  useEffect(() => {
    if (
      categoryIds.length > 0 ||
      excludedCategoryIds.length > 0 ||
      excludedProductIds.length > 0
    ) {
      const group: ProductGroup = {
        _id: `temporaryId${nanoid()}`,
        categoryIds,
        excludedCategoryIds,
        excludedProductIds,
      };

      productGroupsRef.current = [group];
    } else {
      productGroupsRef.current = [];
    }
  }, [categoryIds, excludedCategoryIds, excludedProductIds, productGroupsRef]);

  return (
    <div className="pt-4 space-y-4 border-t">
      <div className="space-y-2">
        <Label htmlFor="branchId" className="text-sm font-medium">
          Choose branch
        </Label>
        <Form.Field
          control={form.control}
          name="branchId"
          render={({ field }) => (
            <SelectBranches.FormItem
              mode="single"
              value={field.value || ''}
              onValueChange={(value) => field.onChange(value || '')}
              className="w-full"
            />
          )}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="paymentIds" className="text-sm font-medium">
          Choose payment
        </Label>
        <SelectPayment
          mode="multiple"
          value={form.watch('paymentIds') || []}
          onValueChange={(value) =>
            form.setValue('paymentIds', value as string[], {
              shouldValidate: true,
            })
          }
          placeholder="Select payments"
        />
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium">PRODUCT CATEGORIES</Label>
          <SelectCategory
            mode="multiple"
            value={categoryIds}
            onValueChange={handleCategorySelect}
            placeholder="Select product categories"
          />
        </div>

        <MoreOptionsButton showMore={showMore} onToggle={toggleMore} />

        {showMore && (
          <>
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                EXCLUDE PRODUCT CATEGORIES
              </Label>
              <SelectCategory
                mode="multiple"
                value={excludedCategoryIds}
                onValueChange={handleExcludeCategorySelect}
                placeholder="Select product categories to exclude"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">EXCLUDE PRODUCTS</Label>
              <SelectProduct
                mode="multiple"
                value={excludedProductIds}
                onValueChange={handleExcludeProductsChange}
                placeholder="Select products to exclude"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};
