import React from 'react';
import { useBrands } from '../hooks/useBrands';
import { Skeleton } from 'erxes-ui';

export const BrandsTotalCount = () => {
  const { totalCount, loading } = useBrands();
  return (
    <div className="text-muted-foreground font-medium text-sm whitespace-nowrap h-7 leading-7">
      {totalCount
        ? `${totalCount} records found`
        : loading && <Skeleton className="w-20 h-4 inline-block mt-1.5" />}
    </div>
  );
};
