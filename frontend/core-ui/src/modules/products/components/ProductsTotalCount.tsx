import { isUndefinedOrNull, Skeleton } from 'erxes-ui';
import { useAtomValue } from 'jotai';
import { productTotalCountAtom } from '@/products/states/productCounts';
import { useTranslation } from 'react-i18next';

export const ProductsTotalCount = () => {
  const { t } = useTranslation();
  const totalCount = useAtomValue(productTotalCountAtom);
  return (
    <div className="h-7 text-sm font-medium leading-7 whitespace-nowrap text-muted-foreground">
      {isUndefinedOrNull(totalCount) ? (
        <Skeleton className="w-20 h-4 inline-block mt-1.5" />
      ) : (
        // Just the number while the list is narrow, so it stays beside the
        // filter instead of wrapping under it.
        <span title={`${totalCount} ${t('records-found')}`}>
          {totalCount}
          <span className="hidden @lg/products:inline">
            {' '}
            {t('records-found')}
          </span>
        </span>
      )}
    </div>
  );
};
