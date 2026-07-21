import { isUndefinedOrNull, Skeleton } from 'erxes-ui';
import { useAtomValue } from 'jotai';
import { useTranslation } from 'react-i18next';
import { companyTotalCountAtom } from '@/contacts/states/CompanyCounts';

export const CompaniesTotalCount = () => {
  const { t } = useTranslation();
  const totalCount = useAtomValue(companyTotalCountAtom);
  return (
    <div className="text-muted-foreground font-medium text-sm whitespace-nowrap h-7 leading-7">
      {isUndefinedOrNull(totalCount) ? (
        <Skeleton className="w-20 h-4 inline-block mt-1.5" />
      ) : (
        t('records-found', '{{count}} records found', { count: totalCount })
      )}
    </div>
  );
};
