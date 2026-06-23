import { PageContainer } from 'erxes-ui';

import { CheckCategoryRecordTable } from '@/erkhet-sync/check-category/components/CheckCategoryRecordTable';
import { CheckCategoryHeader } from '@/erkhet-sync/check-category/components/CheckCategoryHeader';
import { useCheckCategory } from '~/modules/erkhet-sync/check-category/hooks/useCheckCategory';

export const CheckCategoryPage = () => {
  const { loading, toCheckCategories } = useCheckCategory();

  const hasChecked = !!toCheckCategories;

  return (
    <PageContainer>
      <CheckCategoryHeader />

      {hasChecked ? (
        <CheckCategoryRecordTable />
      ) : (
        <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
          {loading ? 'Checking...' : 'Press "Check" to compare Erxes and Erkhet categories'}
        </div>
      )}
    </PageContainer>
  );
};
