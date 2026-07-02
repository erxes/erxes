import React from 'react';
import { useBrands } from '../hooks/useBrands';
import { Skeleton } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const BrandsTotalCount = () => {
  const { t } = useTranslation('settings');
  const { totalCount, loading } = useBrands();
  return (
    <div className="text-muted-foreground font-medium text-sm whitespace-nowrap h-7 leading-7">
      {totalCount
        ? t('records-found', '{{count}} records found', { count: totalCount })
        : loading && <Skeleton className="w-20 h-4 inline-block mt-1.5" />}
    </div>
  );
};
