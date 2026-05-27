import { AccountingDialog } from '@/layout/components/Dialog';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconRefresh } from '@tabler/icons-react';
import { Button, Dialog, Form, Spinner, useMultiQueryState } from 'erxes-ui';
import { useAtomValue } from 'jotai';
import { useState } from 'react';
import { selectedProductIdsAtom } from '../states/productCounts';
import { useForm } from 'react-hook-form';
import { SelectBranches, SelectCategory, SelectDepartments } from 'ui-modules';
import { useReCalcRemainders } from '../hooks/useReCalcRemainders';
import { TReCalcRemainderForm } from '../types/reCalcRemainderForm';
import { reCalcRemainderSchema } from '../types/reCalcRemainderSchema';

export const ReCalcRemainderForm = () => {
  const selectedProductIds = useAtomValue(selectedProductIdsAtom);
  const [open, setOpen] = useState(false);
  const [frozenProductIds, setFrozenProductIds] = useState<string[]>([]);

  const handleOpenChange = (next: boolean) => {
    if (next) setFrozenProductIds(selectedProductIds);
    setOpen(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <Dialog.Trigger asChild>
        <Button variant="outline">
          <IconRefresh size={16} />
          ReCalc Remainder
          {selectedProductIds.length > 0 && (
            <span className="ml-1 rounded-full bg-primary text-primary-foreground text-xs px-1.5 py-0.5 leading-none">
              {selectedProductIds.length}
            </span>
          )}
        </Button>
      </Dialog.Trigger>
      <AccountingDialog
        title="Recalculate Remainders"
        description="Recalculate live inventory remainders"
      >
        <ReCalcRemaindersForm setOpen={setOpen} productIds={frozenProductIds} />
      </AccountingDialog>
    </Dialog>
  );
};

const ReCalcRemaindersForm = ({
  setOpen,
  productIds,
}: {
  setOpen: (open: boolean) => void;
  productIds?: string[];
}) => {
  const [queries] = useMultiQueryState<{
    branchId?: string;
    departmentId?: string;
    categoryIds?: string[];
  }>(['branchId', 'departmentId', 'categoryIds']);

  const form = useForm<TReCalcRemainderForm>({
    resolver: zodResolver(reCalcRemainderSchema),
    defaultValues: {
      branchId: queries.branchId ?? '',
      departmentId: queries.departmentId ?? '',
    },
  });

  const { addSafeRemainder, loading } = useReCalcRemainders();
  const onSubmit = (data: TReCalcRemainderForm) => {
    const variables: Record<string, any> = { ...data };
    if (productIds && productIds.length > 0) {
      variables.productIds = productIds;
    }
    addSafeRemainder({
      variables,
      onCompleted: () => {
        setOpen(false);
        form.reset();
      },
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="px-6 py-4 space-y-4">
          <p className="text-sm text-muted-foreground">
            Select filters to recalculate live inventory remainders. Leave
            fields empty to recalculate all.
          </p>
          <hr className="border-border" />
          <div className="grid grid-cols-1 gap-4">
            <Form.Field
              control={form.control}
              name="branchId"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>Branch</Form.Label>
                  <SelectBranches.FormItem
                    mode="single"
                    value={field.value}
                    onValueChange={field.onChange}
                  />
                  <Form.Message />
                </Form.Item>
              )}
            />
            <Form.Field
              control={form.control}
              name="departmentId"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>Department</Form.Label>
                  <SelectDepartments.FormItem
                    mode="single"
                    value={field.value}
                    onValueChange={field.onChange}
                  />
                  <Form.Message />
                </Form.Item>
              )}
            />
            <Form.Field
              control={form.control}
              name="productCategoryId"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>Product Category</Form.Label>
                  <SelectCategory
                    selected={field.value}
                    onSelect={field.onChange}
                  />
                  <Form.Message />
                </Form.Item>
              )}
            />
          </div>
        </div>
        <hr className="border-border" />
        <Dialog.Footer className="px-6 py-4">
          <Dialog.Close asChild>
            <Button variant="outline" type="button">
              Cancel
            </Button>
          </Dialog.Close>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Spinner />
                Running...
              </>
            ) : (
              <>
                <IconRefresh size={16} />
                Run
              </>
            )}
          </Button>
        </Dialog.Footer>
      </form>
    </Form>
  );
};
