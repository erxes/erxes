import {
  Button,
  Combobox,
  Form,
  Popover,
  Sheet,
  Spinner,
  useMultiQueryState,
} from 'erxes-ui';
import { SelectBranches, SelectCategory, SelectDepartments } from 'ui-modules';

import { AccountingSheet } from '~/modules/layout/components/Sheet';
import { IconCheck, IconRefresh } from '@tabler/icons-react';
import { TReCalcRemainderForm } from '@/inventories/remainders/types/reCalcRemainderForm';
import { reCalcRemainderSchema } from '@/inventories/remainders/types/reCalcRemainderSchema';
import { selectedProductIdsAtom } from '@/inventories/remainders/states/productCounts';
import { useAtomValue } from 'jotai';
import { useForm } from 'react-hook-form';
import { useReCalcRemainders } from '@/inventories/remainders/hooks/useReCalcRemainders';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { zodResolver } from '@hookform/resolvers/zod';

const RecalcLocationSelect = ({
  kind,
  value,
  onValueChange,
}: {
  kind: 'branch' | 'department';
  value?: string;
  onValueChange: (value?: string) => void;
}) => {
  const { t } = useTranslation('accounting');
  const [open, setOpen] = useState(false);
  const SelectLocation = kind === 'branch' ? SelectBranches : SelectDepartments;
  const emptyLabel =
    kind === 'branch'
      ? t('branch-not-assigned', { defaultValue: 'Салбар сонгогдоогүй' })
      : t('department-not-assigned', { defaultValue: 'Нэгж сонгогдоогүй' });

  const handleChange = (nextValue?: string | string[]) => {
    if (typeof nextValue === 'string' || nextValue === undefined) {
      onValueChange(nextValue);
      setOpen(false);
    }
  };

  return (
    <SelectLocation
      mode="single"
      value={value === '_' ? undefined : value}
      onValueChange={handleChange}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <Form.Control>
          <Combobox.Trigger className="w-full shadow-xs">
            {value === '_' ? emptyLabel : <SelectLocation.Value />}
          </Combobox.Trigger>
        </Form.Control>
        <Combobox.Content>
          <div className="border-b p-1">
            <Button
              type="button"
              variant="ghost"
              className="w-full justify-between"
              aria-pressed={value === '_'}
              onClick={() => handleChange(value === '_' ? '' : '_')}
            >
              {emptyLabel}
              {value === '_' && <IconCheck className="size-4" />}
            </Button>
          </div>
          <SelectLocation.Command disableCreateOption />
        </Combobox.Content>
      </Popover>
    </SelectLocation>
  );
};

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

  const onSubmit = (data: TReCalcRemainderForm) => {
    const variables = {
      ...data,
      ...(productIds?.length ? { productIds } : {}),
    };
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
                  <RecalcLocationSelect
                    kind="branch"
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
                  <RecalcLocationSelect
                    kind="department"
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

export const ReCalcRemainderForm = () => {
  const { t } = useTranslation('accounting');
  const selectedProductIds = useAtomValue(selectedProductIdsAtom);
  const [open, setOpen] = useState(false);
  const [frozenProductIds, setFrozenProductIds] = useState<string[]>([]);

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
