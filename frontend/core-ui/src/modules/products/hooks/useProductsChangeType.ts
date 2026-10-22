import { useApolloClient } from '@apollo/client';
import { RecordTable, useToast } from 'erxes-ui';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useProductsEdit } from '@/products/hooks/useProductsEdit';
import type {
  ProductTypeChangeTarget,
  ProductTypeChangeValues,
  UseProductsChangeTypeResult,
} from '@/products/types/productTypeChange';

const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

export const useProductsChangeType = (
  products: ProductTypeChangeTarget[],
): UseProductsChangeTypeResult => {
  const { t } = useTranslation('product');
  const { toast } = useToast();
  const { table } = RecordTable.useRecordTable();
  const { productsEdit } = useProductsEdit();
  const client = useApolloClient();
  const pending = useRef(false);
  const needsRefresh = useRef(false);
  const [saving, setSaving] = useState(false);
  const [refreshPending, setRefreshPending] = useState(false);

  const refreshProducts = async (): Promise<void> => {
    await client.refetchQueries({ include: ['ProductsMain'] });
    needsRefresh.current = false;
    setRefreshPending(false);
  };

  const apply = async (values?: ProductTypeChangeValues): Promise<boolean> => {
    if (pending.current) return false;
    const targets = products.filter((product) => product.status !== 'deleted');
    if (!refreshPending && (!values || !targets.length)) return false;
    pending.current = true;
    setSaving(true);

    try {
      if (refreshPending || !values) {
        await refreshProducts();
        table.setRowSelection({});
        return true;
      }

      const errors: string[] = [];
      const failedSelection: Record<string, boolean> = {};
      let updated = 0;
      // Serialize updates to keep per-product mutation side effects bounded.
      await targets.reduce(async (previous, product) => {
        await previous;
        try {
          await productsEdit({
            variables: {
              _id: product._id,
              type: values.type,
              ...(values.type === 'unique' && {
                duration: values.duration,
                durationType: values.durationType,
              }),
            },
          });
          updated += 1;
        } catch (error) {
          failedSelection[product._id] = true;
          errors.push(getErrorMessage(error));
        }
      }, Promise.resolve());

      toast({
        title: updated
          ? t('bulk.type-changed', 'Type changed for {{count}} products', {
              count: updated,
            })
          : t('bulk.type-change-failed', 'Unable to change product type'),
        description: errors.length
          ? `${t('bulk.type-change-failed-count', '{{count}} updates failed', {
              count: errors.length,
            })}: ${errors[0]}`
          : undefined,
        variant: errors.length ? 'destructive' : 'success',
      });

      if (updated && errors.length) table.setRowSelection(failedSelection);
      needsRefresh.current ||= updated > 0;
      if (needsRefresh.current) {
        setRefreshPending(errors.length === 0);
        await refreshProducts();
      }
      if (!errors.length) table.setRowSelection({});
      return errors.length === 0;
    } catch (error) {
      toast({
        title: t(
          'bulk.type-refresh-failed',
          'Updates saved; unable to refresh products',
        ),
        description: getErrorMessage(error),
        variant: 'destructive',
      });
      return false;
    } finally {
      pending.current = false;
      setSaving(false);
    }
  };

  return { apply, saving, refreshPending };
};
