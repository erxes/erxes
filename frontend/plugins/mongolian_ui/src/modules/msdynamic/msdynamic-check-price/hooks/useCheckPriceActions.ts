import { gql, useMutation } from '@apollo/client';
import { useAtomValue, useSetAtom } from 'jotai';
import { useToast } from 'erxes-ui';
import { mutations } from '../../graphql';
import {
  checkingAtom,
  syncingAtom,
  priceItemsAtom,
  checkResponseDataAtom,
} from '../states/checkPriceStates';
import { IPriceItem, PriceStatus } from '../types/checkPrice';

const GROUP_KEYS: { key: string; status: PriceStatus }[] = [
  { key: 'update', status: 'UPDATE' },
  { key: 'match', status: 'MATCH' },
  { key: 'create', status: 'CREATE' },
  { key: 'delete', status: 'DELETE' },
  { key: 'error', status: 'ERROR' },
];
const CHECK_MSD_PRICES = gql(mutations.toCheckPrices);
const SYNC_MSD_PRICES = gql(mutations.toSyncPrices);

export const useCheckPriceActions = () => {
  const setPriceItems = useSetAtom(priceItemsAtom);
  const setCheckResponseData = useSetAtom(checkResponseDataAtom);
  const setChecking = useSetAtom(checkingAtom);
  const setSyncing = useSetAtom(syncingAtom);
  const priceItems = useAtomValue(priceItemsAtom);
  const { toast } = useToast();

  const [checkMsdPrices] = useMutation(CHECK_MSD_PRICES);
  const [syncMsdPrices] = useMutation(SYNC_MSD_PRICES);

  const checkPrice = async (brandId: string) => {
    try {
      setChecking(true);
      const response = await checkMsdPrices({ variables: { brandId } });
      const data = response.data?.toCheckMsdPrices;

      if (!data) {
        setPriceItems([]);
        setCheckResponseData(null);
        return;
      }

      setCheckResponseData(data);

      const allItems: IPriceItem[] = GROUP_KEYS.flatMap(({ key, status }) =>
        (data[key]?.items || []).map((item: any) => ({
          ...item,
          status,
          isSynced: false,
        })),
      );

      setPriceItems(allItems);
      toast({
        title: 'Success',
        description: `${allItems.length} price items found`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to check prices',
        variant: 'destructive',
      });
    } finally {
      setChecking(false);
    }
  };

  const syncPrices = async (brandId: string) => {
    if (!brandId) return;
    try {
      setSyncing(true);
      const items = (priceItems || []).filter((i) => !i.isSynced);

      if (items.length > 0) {
        await syncMsdPrices({
          variables: { prices: items },
        });

        setPriceItems(
          (priceItems || []).map((i) =>
            items.some((s) => s.Item_No === i.Item_No && s.code === i.code)
              ? { ...i, isSynced: true }
              : i,
          ),
        );
      }

      toast({ title: 'Success', description: 'Prices synced successfully' });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to sync prices',
        variant: 'destructive',
      });
    } finally {
      setSyncing(false);
    }
  };

  return { checkPrice, syncPrices };
};
