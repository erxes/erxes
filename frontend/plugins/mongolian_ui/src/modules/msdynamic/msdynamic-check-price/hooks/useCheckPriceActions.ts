import { gql, useMutation } from '@apollo/client';
import { useSetAtom } from 'jotai';
import { useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

import { mutations } from '@/msdynamic/graphql';
import {
  checkingAtom,
  syncingAtom,
  priceItemsAtom,
  checkResponseDataAtom,
} from '../states/checkPriceStates';
import {
  IPriceItem,
  ICheckPriceResponse,
  PriceStatus,
} from '../types/checkPrice';

type GroupKey = 'update' | 'match' | 'create' | 'delete' | 'error';

const GROUP_KEYS: { key: GroupKey; status: PriceStatus }[] = [
  { key: 'update', status: 'UPDATE' },
  { key: 'match', status: 'MATCH' },
  { key: 'create', status: 'CREATE' },
  { key: 'delete', status: 'DELETE' },
  { key: 'error', status: 'ERROR' },
];
const CHECK_MSD_PRICES = gql(mutations.toCheckPrices);
const SYNC_MSD_PRICES = gql(mutations.toSyncPrices);

type CheckPricesData = {
  toCheckMsdPrices?: ICheckPriceResponse;
};
type CheckPricesVariables = { brandId: string };
type SyncPricesData = { toSyncMsdPrices?: { status: string } };
type SyncPricesVariables = { prices: IPriceItem[] };

type Props = {
  brandId: string;
  syncableItems: IPriceItem[];
};

const normalizePriceItem = (
  item: IPriceItem,
  status: PriceStatus,
): IPriceItem => ({
  ...item,
  status,
  isSynced: item.syncStatus === true,
});

const normalizePricesResponse = (response: ICheckPriceResponse): IPriceItem[] =>
  GROUP_KEYS.flatMap(({ key, status }) =>
    (response[key]?.items || []).map((item) =>
      normalizePriceItem(item, status),
    ),
  );

export const useCheckPriceActions = ({ brandId, syncableItems }: Props) => {
  const setPriceItems = useSetAtom(priceItemsAtom);
  const setCheckResponseData = useSetAtom(checkResponseDataAtom);
  const setChecking = useSetAtom(checkingAtom);
  const setSyncing = useSetAtom(syncingAtom);
  const { t } = useTranslation('mongolian');
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

      const allItems = normalizePricesResponse(data);

      setPriceItems(allItems);
      toast({
        title: t('success', 'Success'),
        description: t('price-items-found', '{{count}} price items found', { count: allItems.length }),
      });
    } catch {
      toast({
        title: t('error', 'Error'),
        description: t('failed-to-check-prices', 'Failed to check MS Dynamic prices'),
        variant: 'destructive',
      });
    } finally {
      setChecking(false);
    }
  };

  const syncPrices = async (selectedPrices?: IPriceItem[]) => {
    const itemsToSync = selectedPrices || syncableItems;
    if (!itemsToSync.length) return;
    try {
      setSyncing(true);

      await syncMsdPrices({ variables: { prices: itemsToSync } });

      const refreshed = await checkMsdPrices({ variables: { brandId } });
      const refreshedData = refreshed.data?.toCheckMsdPrices;
      const nextItems = refreshedData
        ? normalizePricesResponse(refreshedData)
        : [];

      setPriceItems(nextItems);
      setCheckResponseData(refreshedData || null);

      toast({
        title: t('success', 'Success'),
        description: t('prices-synced', '{{count}} prices synced', { count: itemsToSync.length }),
      });
    } catch {
      toast({
        title: t('error', 'Error'),
        description: t('failed-to-sync-prices', 'Failed to sync MS Dynamic prices'),
        variant: 'destructive',
      });
    } finally {
      setSyncing(false);
    }
  };

  return { checkPrice, syncPrices };
};
