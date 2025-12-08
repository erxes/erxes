import {
  Form,
  Label,
  MultipleSelector,
  MultiSelectOption,
  Button,
} from 'erxes-ui';
import { useMemo, useState, useEffect, type MutableRefObject } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { PosFormData } from '@/pos/components/pos-create/PosCreate';
import { SelectBranches } from 'ui-modules';
import { usePayments } from '@/pos/hooks/usePayments';
import { AddProductGroupDialog } from '@/pos/components/pos-create/AddProductGroupDialog';
import { ProductGroup } from '@/pos/pos-detail/types/IPos';
import { IconEdit, IconTrash } from '@tabler/icons-react';

interface EcommerceFieldsProps {
  form: UseFormReturn<PosFormData>;
  productGroupsRef: MutableRefObject<ProductGroup[]>;
}

export const EcommerceFields = ({
  form,
  productGroupsRef,
}: EcommerceFieldsProps) => {
  const [productGroups, setProductGroups] = useState<ProductGroup[]>([]);
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

  const handleGroupAdded = (group: ProductGroup) => {
    setProductGroups((prev) => [...prev, group]);
  };

  const handleGroupRemove = (groupId: string) => {
    setProductGroups((prev) => prev.filter((g) => g._id !== groupId));
  };

  const [editingGroup, setEditingGroup] = useState<ProductGroup | null>(null);

  const handleGroupUpdated = (updatedGroup: ProductGroup) => {
    setProductGroups((prev) =>
      prev.map((g) => (g._id === updatedGroup._id ? updatedGroup : g)),
    );
    setEditingGroup(null);
  };

  useEffect(() => {
    productGroupsRef.current = productGroups;
  }, [productGroups, productGroupsRef]);

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
        <Label className="text-sm font-medium">Product Groups</Label>
        {productGroups.length > 0 && (
          <div className="mt-2 space-y-2">
            {productGroups.map((group) => (
              <div
                key={group._id}
                className="flex gap-2 justify-between items-center px-3 py-2 text-sm rounded-md border bg-background"
              >
                <span className="flex-1 min-w-0 break-all">{group.name}</span>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setEditingGroup(group)}
                  >
                    <IconEdit size={14} />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => group._id && handleGroupRemove(group._id)}
                    className="text-destructive"
                  >
                    <IconTrash size={14} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <AddProductGroupDialog
          onGroupAdded={handleGroupAdded}
          onGroupUpdated={handleGroupUpdated}
          editingGroup={editingGroup}
          onEditComplete={() => setEditingGroup(null)}
        />
      </div>
    </div>
  );
};
