import { isUndefinedOrNull, Skeleton } from 'erxes-ui';
import { useAtomValue } from 'jotai';
import { useTranslation } from 'react-i18next';
import { cpUserTotalCountAtom } from '@/contacts/client-portal-users/states/cpUserCounts';

export const ClientPortalUsersTotalCount = () => {
  const { t } = useTranslation();
  const totalCount = useAtomValue(cpUserTotalCountAtom);
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
