import { PageContainer, PageSubHeader } from 'erxes-ui';
import { CheckProductRecordTable } from '@/erkhet-sync/check-products/components/CheckProductRecordTable';
import { CheckProductHeader } from '@/erkhet-sync/check-products/components/CheckProductHeader';
import { CheckProductFilter } from '@/erkhet-sync/check-products/components/CheckProductFilter';
import { useCheckProduct } from '~/modules/erkhet-sync/check-products/hooks/useCheckProduct';
import CheckButton from '~/modules/erkhet-sync/check-products/components/useCheckButton';

export const CheckProductsPage = () => {
  const { setSelectedFilter } = useCheckProduct();

  const handleFilterClick = (filter: 'create' | 'update' | 'delete') => {
    setSelectedFilter(filter);
  };

  return (
    <PageContainer>
      <CheckProductHeader />
      <PageSubHeader className="flex justify-between items-center">
        <CheckProductFilter onFilterClick={handleFilterClick} />
        <CheckButton />
      </PageSubHeader>
      <CheckProductRecordTable />
    </PageContainer>
  );
};
