import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useBulkEditCategories } from '../../hooks/useBulkEditCategories';
import { useCategories } from '../../hooks/useCategoriesEnhanced';
import { BulkEditWithStatusAndParent } from '@/cms/shared/components/BulkEditWithStatusAndParent';

const CATEGORY_STATUS_DATA = [
  { value: 'active' },
  { value: 'inactive' },
];

export const CategoriesBulkEdit = ({ clientPortalId }: { clientPortalId: string }) => {
  const { t } = useTranslation('content');
  const [currentContent, setCurrentContent] = useState('main');

  const { bulkEditCategories, loading } = useBulkEditCategories();

  const { categories, loading: catsLoading } = useCategories({
    variables: { clientPortalId, status: undefined },
    skip: currentContent !== 'parent',
  });

  return (
    <BulkEditWithStatusAndParent
      loading={loading}
      statusItems={CATEGORY_STATUS_DATA}
      parentItems={categories}
      parentLoading={catsLoading}
      parentSearchPlaceholder={t('search-categories')}
      onBulkEdit={(ids, input) => bulkEditCategories(ids, input)}
      onContentChange={setCurrentContent}
    />
  );
};
