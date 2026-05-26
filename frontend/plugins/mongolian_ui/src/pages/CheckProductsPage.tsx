import { PageContainer } from 'erxes-ui';

import { CheckProductRecordTable } from '@/erkhet-sync/check-products/components/CheckProductRecordTable';
import { CheckProductHeader } from '@/erkhet-sync/check-products/components/CheckProductHeader';
import { useCheckProduct } from '~/modules/erkhet-sync/check-products/hooks/useCheckProduct';

export const CheckProductsPage = () => {
  const { loading, toCheckProducts } = useCheckProduct();

  const hasChecked = !!toCheckProducts;

  return (
    <PageContainer>
      <CheckProductHeader />

      {hasChecked ? (
        <CheckProductRecordTable />
      ) : (
        <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
          {loading ? 'Checking...' : 'Press "Check" to compare Erxes and Erkhet products'}
        </div>
      )}
    </PageContainer>
  );
};
