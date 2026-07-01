import { AccountingSheet } from '~/modules/layout/components/Sheet';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconRefresh } from '@tabler/icons-react';
import { Button, Form, Sheet, Spinner, useMultiQueryState } from 'erxes-ui';
import { useAtomValue } from 'jotai';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { selectedProductIdsAtom } from '../states/productCounts';
import { useForm } from 'react-hook-form';
import { SelectBranches, SelectCategory, SelectDepartments } from 'ui-modules';
import { useReCalcRemainders } from '../hooks/useReCalcRemainders';
import { TReCalcRemainderForm } from '../types/reCalcRemainderForm';
import { reCalcRemainderSchema } from '../types/reCalcRemainderSchema';

const ReCalcRemaindersForm = ({
  setOpen,
  productIds,
}: {
  setOpen: (open: boolean) => void;
  productIds?: string[];
}) => {
  const { t } = useTranslation('accounting');
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
  /** ene recalc mutation duudna. */
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
      <form
        className="flex flex-col flex-1 min-h-0 bg-background"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <div className="flex-1 min-h-0 overflow-y-auto p-5 space-y-4">
          <p className="text-sm text-muted-foreground">
            {t('select-filters-to-recalculate')}
          </p>
          <div className="grid grid-cols-1 gap-4">
            <Form.Field
              control={form.control}
              name="branchId"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>{t('branch')}</Form.Label>
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
                  <Form.Label>{t('department')}</Form.Label>
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
                  <Form.Label>{t('product-category')}</Form.Label>
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

        <Sheet.Footer className="px-5 py-4 border-t bg-background shrink-0">
          <Button
            variant="outline"
            type="button"
            onClick={() => setOpen(false)}
          >
            {t('cancel')}
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Spinner />
                {t('running')}
              </>
            ) : (
              <>
                <IconRefresh size={16} />
                {t('run')}
              </>
            )}
          </Button>
        </Sheet.Footer>
      </form>
    </Form>
  );
};

/** ene recalc sheet open hiine. */
export const ReCalcRemainderForm = () => {
  const { t } = useTranslation('accounting');
  const selectedProductIds = useAtomValue(selectedProductIdsAtom);
  const [open, setOpen] = useState(false);
  const [frozenProductIds, setFrozenProductIds] = useState<string[]>([]);

  /** ene open bolohdoo product ids hadgalna. */
  const handleOpenChange = (next: boolean) => {
    if (next) setFrozenProductIds(selectedProductIds);
    setOpen(next);
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange} modal>
      <Sheet.Trigger asChild>
        <Button variant="outline">
          <IconRefresh size={16} />
          {t('recalc-remainder')}
          {selectedProductIds.length > 0 && (
            <span className="ml-1 rounded-full bg-primary text-primary-foreground text-xs px-1.5 py-0.5 leading-none">
              {selectedProductIds.length}
            </span>
          )}
        </Button>
      </Sheet.Trigger>
      <AccountingSheet title={t('recalculate-remainders')}>
        <ReCalcRemaindersForm setOpen={setOpen} productIds={frozenProductIds} />
      </AccountingSheet>
    </Sheet>
  );
};
