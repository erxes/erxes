import {
  Label,
  Button,
  Form,
  MultipleSelector,
  MultiSelectOption,
} from 'erxes-ui';
import { useMemo, useState, useEffect, useCallback } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { PosFormData } from '@/pos/components/pos-create/PosCreate';
import {
  SelectBranches,
  SelectMember,
  SelectCategory,
  SelectProduct,
} from 'ui-modules';
import { usePayments } from '@/pos/hooks/usePayments';
import { ProductGroup } from '@/pos/pos-detail/types/IPos';
import { IconChevronDown, IconChevronUp } from '@tabler/icons-react';
import { SlotsDialog } from '@/pos/components/pos-create/SlotsDialog';
import type { CustomNode } from '@/pos/slot/types';
import { nanoid } from 'nanoid';

interface RestaurantFieldsProps {
  form: UseFormReturn<PosFormData>;
  productGroupsRef?: React.MutableRefObject<ProductGroup[]>;
  slotsRef?: React.MutableRefObject<CustomNode[]>;
}

export const RestaurantFields = ({
  form,
  productGroupsRef,
  slotsRef,
}: RestaurantFieldsProps) => {
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [excludedCategoryIds, setExcludedCategoryIds] = useState<string[]>([]);
  const [excludedProductIds, setExcludedProductIds] = useState<string[]>([]);
  const [showMore, setShowMore] = useState(false);

  const { payments, loading: paymentsLoading } = usePayments({
    status: 'active',
  });

  const paymentOptions: MultiSelectOption[] = useMemo(
    () =>
      payments.map((payment) => ({ value: payment._id, label: payment.name })),
    [payments],
  );
  const selectedPaymentIds = form.watch('paymentIds') || [];
  const selectedPayments = paymentOptions.filter((opt) =>
    selectedPaymentIds.includes(opt.value),
  );

  const toggleMore = useCallback(() => setShowMore((prev) => !prev), []);

  const handleCategorySelect = useCallback((categoryId: string) => {
    setCategoryIds([categoryId]);
  }, []);

  const handleExcludeCategorySelect = useCallback((categoryId: string) => {
    setExcludedCategoryIds([categoryId]);
  }, []);

  const handleExcludeProductsChange = useCallback(
    (value: string | string[]) => {
      setExcludedProductIds(value as string[]);
    },
    [],
  );

  useEffect(() => {
    if (productGroupsRef) {
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
    }
  }, [categoryIds, excludedCategoryIds, excludedProductIds, productGroupsRef]);

  return (
    <div className="pt-4 space-y-4 border-t">
      <SlotsDialog
        value={form.watch('slots')}
        onChange={(value, nodes) => {
          form.setValue('slots', value, { shouldValidate: true });
          if (slotsRef && nodes) {
            slotsRef.current = nodes;
          }
        }}
      />

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
        <MultipleSelector
          value={selectedPayments}
          onChange={(values) =>
            form.setValue(
              'paymentIds',
              values.map((v) => v.value),
              { shouldValidate: true },
            )
          }
          defaultOptions={paymentOptions}
          placeholder={paymentsLoading ? 'Loading...' : 'Select payments'}
          hidePlaceholderWhenSelected
          disabled={paymentsLoading}
          className="w-full bg-background"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium">Admin</Label>
        <Form.Field
          control={form.control}
          name="adminIds"
          render={({ field }) => (
            <SelectMember.FormItem
              mode="multiple"
              value={field.value || []}
              onValueChange={(value) => field.onChange(value as string[])}
              placeholder="Select admins"
              className="w-full"
            />
          )}
        />
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium">Cashier</Label>
        <Form.Field
          control={form.control}
          name="cashierIds"
          render={({ field }) => (
            <SelectMember.FormItem
              mode="multiple"
              value={field.value || []}
              onValueChange={(value) => field.onChange(value as string[])}
              placeholder="Select cashiers"
              className="w-full"
            />
          )}
        />
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium">Initial product category</Label>
        <SelectCategory
          selected={(form.watch('initialCategoryIds') || [])[0] || ''}
          onSelect={
            ((categoryId: string) =>
              form.setValue('initialCategoryIds', [categoryId], {
                shouldValidate: true,
              })) as unknown as React.ReactEventHandler<HTMLButtonElement> &
              ((categoryId: string) => void)
          }
        />
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium">PRODUCT CATEGORY</Label>
          <SelectCategory
            selected={categoryIds[0] ?? ''}
            onSelect={
              handleCategorySelect as unknown as React.ReactEventHandler<HTMLButtonElement> &
                ((categoryId: string) => void)
            }
          />
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={toggleMore}
          className="flex gap-1 items-center text-muted-foreground"
        >
          {showMore ? (
            <IconChevronUp size={16} />
          ) : (
            <IconChevronDown size={16} />
          )}
          {showMore ? 'Hide more options' : 'More options'}
        </Button>

        {showMore && (
          <>
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                EXCLUDE PRODUCT CATEGORY
              </Label>
              <SelectCategory
                selected={excludedCategoryIds[0] ?? ''}
                onSelect={
                  handleExcludeCategorySelect as unknown as React.ReactEventHandler<HTMLButtonElement> &
                    ((categoryId: string) => void)
                }
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
