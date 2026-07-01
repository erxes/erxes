import { isUndefinedOrNull, Skeleton } from 'erxes-ui';
import { useAtomValue } from 'jotai';
import { useTranslation } from 'react-i18next';
import {
  accountingCheckSyncedDealsStatusCountsAtom,
  accountingCheckSyncedDealsTotalCountAtom,
} from '../states';

export const AccountingCheckSyncedDealsTotalCount = () => {
  const { t } = useTranslation('accounting');
  const totalCount = useAtomValue(accountingCheckSyncedDealsTotalCountAtom);
  const counts = useAtomValue(accountingCheckSyncedDealsStatusCountsAtom);

  return (
    <div className="text-muted-foreground font-medium text-sm flex flex-wrap gap-x-3 gap-y-1 min-h-7 leading-7">
      {isUndefinedOrNull(totalCount) ? (
        <Skeleton className="w-20 h-4 inline-block mt-1.5" />
      ) : (
        <>
          <span>{totalCount} {t('records')}</span>
          <span>{t('checked')} {counts.checked}</span>
          <span>{t('synced')} {counts.synced}</span>
          <span>{t('skipped')} {counts.skipped}</span>
          <span>{t('pending')} {counts.pending}</span>
          <span>{t('error')} {counts.error}</span>
          <span>{t('resynced')} {counts.resynced}</span>
          <span>{t('toSync')} {counts.toSync}</span>
        </>
      )}
    </div>
  );
};
