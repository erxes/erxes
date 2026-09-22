import { isUndefinedOrNull, Skeleton } from 'erxes-ui';
import { useAtomValue } from 'jotai';
import { useTranslation } from 'react-i18next';
import { duplicatedTotalCountAtom } from '~/modules/ebarimt/put-response/put-responses-duplicated/states/DuplicatedCounts';

export const DuplicatedTotalCount = () => {
  const totalCount = useAtomValue(duplicatedTotalCountAtom);
  const { t } = useTranslation('mongolian');
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
