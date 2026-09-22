import { isUndefinedOrNull, Skeleton } from 'erxes-ui';
import { useAtomValue } from 'jotai';
import { msDynamicSyncHistoryTotalCountAtom } from '../states/msDynamicSyncHistoryCounts';
import { useTranslation } from 'react-i18next';

export const MSDynamicSyncHistoryTotalCount = () => {
  const { t } = useTranslation('mongolian');
  const totalCount = useAtomValue(msDynamicSyncHistoryTotalCountAtom);

  return (
    <div className="text-muted-foreground font-medium text-sm whitespace-nowrap h-7 leading-7">
      {isUndefinedOrNull(totalCount) ? (
        <Skeleton className="w-20 h-4 inline-block mt-1.5" />
      ) : (
        t('records-found', { count: totalCount })
      )}
    </div>
  );
};
