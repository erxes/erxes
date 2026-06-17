import { gql, useMutation } from '@apollo/client';
import { useSetAtom } from 'jotai';
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

type CheckPricesData = { toCheckMsdPrices?: Record<string, { items: any[] }> };
type CheckPricesVariables = { brandId: string };
type SyncPricesData = { toSyncMsdPrices?: { status: string } };
type SyncPricesVariables = { prices: IPriceItem[] };

type Props = {
  brandId: string;
  syncableItems: IPriceItem[];
};

export const useCheckPriceActions = ({ brandId, syncableItems }: Props) => {
  const setPriceItems = useSetAtom(priceItemsAtom);
  const setCheckResponseData = useSetAtom(checkResponseDataAtom);
  const setChecking = useSetAtom(checkingAtom);
  const setSyncing = useSetAtom(syncingAtom);
  const { toast } = useToast();

  const [checkMsdPrices] = useMutation<CheckPricesData, CheckPricesVariables>(
    CHECK_MSD_PRICES,
  );
  const [syncMsdPrices] = useMutation<SyncPricesData, SyncPricesVariables>(
    SYNC_MSD_PRICES,
  );

  const checkPrice = async () => {
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

  const syncPrices = async () => {
    if (!syncableItems.length) return;
    try {
      setSyncing(true);

      await syncMsdPrices({ variables: { prices: syncableItems } });

      const refreshed = await checkMsdPrices({ variables: { brandId } });
      const refreshedData = refreshed.data?.toCheckMsdPrices;
      const nextItems = refreshedData
        ? GROUP_KEYS.flatMap(({ key, status }) =>
            (refreshedData[key]?.items || []).map((item: any) => ({
              ...item,
              status,
              isSynced: false,
            })),
          )
        : [];

      setPriceItems(nextItems);
      setCheckResponseData(refreshedData || null);

      toast({
        title: 'Success',
        description: `${syncableItems.length} prices synced`,
      });
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
