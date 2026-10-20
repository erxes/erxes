import { useMutation } from '@apollo/client';
import { useSetAtom } from 'jotai';
import { useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

import { mutations } from '@/msdynamic/graphql';
import { jsonRecords } from '@/shared/utils/json';
import type { MsdynamicCheckPricesMutation } from '~/gql/graphql';
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
const CHECK_MSD_PRICES = mutations.toCheckPrices;
const SYNC_MSD_PRICES = mutations.toSyncPrices;

type CheckPricesResult = NonNullable<
  MsdynamicCheckPricesMutation['toCheckMsdPrices']
>;

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

const toCheckPriceResponse = (
  result: CheckPricesResult,
): ICheckPriceResponse => ({
  update: { items: jsonRecords<IPriceItem>(result.update.items) },
  match: { items: jsonRecords<IPriceItem>(result.match.items) },
  create: { items: jsonRecords<IPriceItem>(result.create.items) },
  delete: { items: jsonRecords<IPriceItem>(result.delete.items) },
  error: { items: jsonRecords<IPriceItem>(result.error.items) },
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

  const [checkMsdPrices] = useMutation(CHECK_MSD_PRICES);
  const [syncMsdPrices] = useMutation(SYNC_MSD_PRICES);

  const checkPrice = async () => {
    try {
      setChecking(true);
      const response = await checkMsdPrices({ variables: { brandId } });
      const result = response.data?.toCheckMsdPrices;

      if (!result) {
        setPriceItems([]);
        setCheckResponseData(null);
        return;
      }

      const data = toCheckPriceResponse(result);
      setCheckResponseData(data);

      const allItems = normalizePricesResponse(data);

      setPriceItems(allItems);
      toast({
        title: t('success'),
        description: t('price-items-found', { count: allItems.length }),
      });
    } catch {
      toast({
        title: t('error'),
        description: t('failed-to-check-prices'),
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

      await syncMsdPrices({ variables: { prices: itemsToSync, brandId } });

      const refreshed = await checkMsdPrices({ variables: { brandId } });
      const refreshedResult = refreshed.data?.toCheckMsdPrices;
      const refreshedData = refreshedResult
        ? toCheckPriceResponse(refreshedResult)
        : null;
      const nextItems = refreshedData
        ? normalizePricesResponse(refreshedData)
        : [];

      setPriceItems(nextItems);
      setCheckResponseData(refreshedData || null);

      toast({
        title: t('success'),
        description: t('prices-synced', { count: itemsToSync.length }),
      });
    } catch {
      toast({
        title: t('error'),
        description: t('failed-to-sync-prices'),
        variant: 'destructive',
      });
    } finally {
      setSyncing(false);
    }
  };

  return { checkPrice, syncPrices };
};
