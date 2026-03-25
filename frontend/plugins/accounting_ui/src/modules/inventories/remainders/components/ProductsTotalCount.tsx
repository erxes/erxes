import { isUndefinedOrNull, Skeleton } from 'erxes-ui';
import { useAtomValue } from 'jotai';
import { useTranslation } from 'react-i18next';
import { productTotalCountAtom } from '../states/productCounts';

export const ProductsTotalCount = () => {
  const { t } = useTranslation();
  const totalCount = useAtomValue(productTotalCountAtom);
  return (
    <div className="h-7 text-sm font-medium leading-7 whitespace-nowrap text-muted-foreground">
      {isUndefinedOrNull(totalCount) ? (
        <Skeleton className="w-20 h-4 inline-block mt-1.5" />
      ) : (
        `${totalCount} ${t('records-found')}`
      )}
    </div>
  );
};
