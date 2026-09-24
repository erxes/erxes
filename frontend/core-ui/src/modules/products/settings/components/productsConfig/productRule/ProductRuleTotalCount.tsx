import { Skeleton } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useProductRules } from '@/products/settings/hooks/useProductRules';

export const ProductRuleTotalCount = () => {
  const { t } = useTranslation();
  const { productRules, loading } = useProductRules();

  return (
    <div className="h-7 text-sm font-medium leading-7 whitespace-nowrap text-muted-foreground">
      {loading ? (
        <Skeleton className="w-20 h-4 inline-block mt-1.5" />
      ) : (
        `${productRules?.length ?? 0} ${t('records-found')}`
      )}
    </div>
  );
};
