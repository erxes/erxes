import { isUndefinedOrNull, Skeleton } from 'erxes-ui';
import { useAtomValue } from 'jotai';
import { useTranslation } from 'react-i18next';
import {
  posCoverTotalCountAtom,
  posCoverTotalCountLoadingAtom,
} from '@/pos/pos-covers/states/usePosCoversCounts';

export const PosCoverTotalCount = () => {
  const { t } = useTranslation('sales');
  const totalCount = useAtomValue(posCoverTotalCountAtom);
  const loading = useAtomValue(posCoverTotalCountLoadingAtom);
  return (
    <div className="text-muted-foreground font-medium text-sm whitespace-nowrap h-7 leading-7">
      {isUndefinedOrNull(totalCount)
        ? loading && <Skeleton className="w-20 h-4 inline-block mt-1.5" />
        : t('records-found', { count: totalCount })}
    </div>
  );
};
