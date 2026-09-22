import { PageSubHeader } from 'erxes-ui';
import { CheckCategoryRecordTable } from '@/erkhet-sync/check-category/components/CheckCategoryRecordTable';
import { CheckCategoryFilter } from '@/erkhet-sync/check-category/components/CheckCategoryFilter';
import { useCheckCategory } from '~/modules/erkhet-sync/check-category/hooks/useCheckCategory';
import CheckButton from '~/modules/erkhet-sync/check-category/components/useCheckButton';

export const CheckCategoryPage = () => {
  const { setSelectedFilter } = useCheckCategory();

  const handleFilterClick = (filter: 'create' | 'update' | 'delete') => {
    setSelectedFilter(filter);
  };

  return (
    <>
      <PageSubHeader className="flex justify-between items-center">
        <CheckCategoryFilter onFilterClick={handleFilterClick} />
        <CheckButton />
      </PageSubHeader>

      <CheckCategoryRecordTable />
    </>
  );
};
