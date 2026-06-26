import { gql, useMutation } from '@apollo/client';
import { useAtom, useSetAtom } from 'jotai';
import { useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { mutations } from '../../graphql';
import {
  customerItemsAtom,
  customerCheckResponseAtom,
  customerCheckingAtom,
  customerSyncingAtom,
} from '../states/checkCustomerStates';
import { ICustomerItem, CustomerStatus } from '../types/checkCustomer';

interface ICheckResponse {
  toCheckMsdCustomers: {
    update: { items: ICustomerItem[] };
    create: { items: ICustomerItem[] };
    delete: { items: ICustomerItem[] };
  };
}

export const useCheckCustomerActions = (brandId: string) => {
  const [checking, setChecking] = useAtom(customerCheckingAtom);
  const [syncing, setSyncing] = useAtom(customerSyncingAtom);
  const setItems = useSetAtom(customerItemsAtom);
  const setResponse = useSetAtom(customerCheckResponseAtom);
  const { t } = useTranslation('mongolian');
  const { toast } = useToast();

  const [toCheckMsdCustomers] = useMutation<ICheckResponse>(
    gql(mutations.toCheckCustomers),
  );

  const [toSyncMsdCustomers] = useMutation(gql(mutations.toSyncCustomers));

  const flattenItems = (
    response: ICheckResponse['toCheckMsdCustomers'],
  ): ICustomerItem[] => {
    const all: ICustomerItem[] = [];
    const groups: { key: CustomerStatus; items: ICustomerItem[] }[] = [
      { key: 'UPDATE', items: response.update.items },
      { key: 'CREATE', items: response.create.items },
      { key: 'DELETE', items: response.delete.items },
    ];
    for (const group of groups) {
      for (const item of group.items) {
        all.push({ ...item, status: group.key, isSynced: false });
      }
    }
    return all;
  };

  const checkCustomers = async () => {
    try {
      setChecking(true);

      const response = await toCheckMsdCustomers({
        variables: { brandId },
      });

      const data = response.data?.toCheckMsdCustomers;
      if (!data) return;

      setResponse(data);
      setItems(flattenItems(data));

      toast({
        title: t('customers-checked-successfully'),
        variant: 'success',
      });
    } catch (e: unknown) {
      const description =
        e instanceof Error ? e.message : 'Unexpected error occurred';
      toast({
        title: t('failed-to-check-customers'),
        description,
        variant: 'destructive',
      });
    } finally {
      setChecking(false);
    }
  };

  const syncCustomers = async (selectedCustomers: ICustomerItem[]) => {
    try {
      setSyncing(true);

      const toSync = selectedCustomers.filter((i) => i.status !== 'DELETE');
      const toDelete = selectedCustomers.filter((i) => i.status === 'DELETE');

      if (toSync.length) {
        await toSyncMsdCustomers({
          variables: {
            brandId,
            action: 'create',
            customers: toSync,
          },
        });
      }

      if (toDelete.length) {
        await toSyncMsdCustomers({
          variables: {
            brandId,
            action: 'delete',
            customers: toDelete,
          },
        });
      }

      const syncedNos = new Set(
        selectedCustomers
          .map((c) => c.No ?? c.code)
          .filter((key): key is string => Boolean(key)),
      );

      setItems((prev) =>
        prev.map((item) => {
          const key = item.No ?? item.code;
          return key && syncedNos.has(key) ? { ...item, isSynced: true } : item;
        }),
      );

      toast({
        title: t('customers-synced-successfully'),
        variant: 'success',
      });
    } catch (e: unknown) {
      const description =
        e instanceof Error ? e.message : 'Unexpected error occurred';
      toast({
        title: t('failed-to-sync-customers'),
        description,
        variant: 'destructive',
      });
      throw e;
    } finally {
      setSyncing(false);
    }
  };

  return { checkCustomers, syncCustomers, checking, syncing };
};
