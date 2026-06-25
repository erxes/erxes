import { PageContainer, PageSubHeader } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

import { CheckCategoryRecordTable } from '@/erkhet-sync/check-category/components/CheckCategoryRecordTable';
import { CheckCategoryHeader } from '@/erkhet-sync/check-category/components/CheckCategoryHeader';
import { CheckCategoryFilter } from '@/erkhet-sync/check-category/components/CheckCategoryFilter';
import { useCheckCategory } from '~/modules/erkhet-sync/check-category/hooks/useCheckCategory';
import CheckButton from '~/modules/erkhet-sync/check-category/components/useCheckButton';

export const CheckCategoryPage = () => {
  const { t } = useTranslation('mongolian');
  const { loading, toCheckCategories, setSelectedFilter } = useCheckCategory();

  const handleFilterClick = (filter: 'create' | 'update' | 'delete') => {
    setSelectedFilter(filter);
  };

  return (
    <PageContainer>
      <CheckCategoryHeader />
      <PageSubHeader className="flex justify-between items-center">
        <CheckCategoryFilter onFilterClick={handleFilterClick} />
        <CheckButton />
      </PageSubHeader>

      {toCheckCategories && toCheckCategories.length > 0 ? (
        <CheckCategoryRecordTable />
      ) : (
        <div className="m-3 text-center text-muted-foreground">
          {loading ? t('checking') : t('no-data-found')}
        </div>
      )}
    </PageContainer>
  );
};
