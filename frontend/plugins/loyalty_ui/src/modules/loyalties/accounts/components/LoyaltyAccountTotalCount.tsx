import { isUndefinedOrNull, Skeleton } from 'erxes-ui';
import { useAtomValue } from 'jotai';
import { useTranslation } from 'react-i18next';
import { loyaltyAccountTotalCountAtom } from '../states/accountCounts';

export const LoyaltyAccountTotalCount = () => {
  const { t } = useTranslation('loyalty');
  const totalCount = useAtomValue(loyaltyAccountTotalCountAtom);

  return (
    <div className="h-7 whitespace-nowrap text-sm font-medium leading-7 text-muted-foreground">
      {isUndefinedOrNull(totalCount) ? (
        <Skeleton className="mt-1.5 inline-block h-4 w-20" />
      ) : (
        `${totalCount} ${t('records-found')}`
      )}
    </div>
  );
};
