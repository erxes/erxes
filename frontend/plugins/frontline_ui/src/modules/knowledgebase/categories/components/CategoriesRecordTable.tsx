import { IconFolders } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { CategoriesCommandBar } from '@/knowledgebase/categories/components/categories-command-bar/CategoriesCommandBar';
import { useCategoriesColumns } from '@/knowledgebase/categories/components/CategoriesColumns';
import { useCategories } from '@/knowledgebase/categories/hooks/useCategories';
import { sortCategoriesAsTree } from '@/knowledgebase/categories/utils/sortCategoriesAsTree';
import { CATEGORIES_TABLE_ID } from '@/knowledgebase/constants';
import { KbRecordTable } from '@/knowledgebase/shared/components/KbRecordTable';
import { KbEmptyState } from '@/knowledgebase/shared/components/KbStates';

export const CategoriesRecordTable = ({
  topicId,
  onCreate,
}: {
  topicId: string;
  onCreate: () => void;
}) => {
  const { t } = useTranslation('frontline');
  const { categories, loading, error } = useCategories(topicId);
  const columns = useCategoriesColumns();

  const rows = useMemo(
    () => sortCategoriesAsTree(categories ?? []),
    [categories],
  );

  return (
    <KbRecordTable
      columns={columns}
      data={rows}
      loading={loading}
      error={error}
      tableId={CATEGORIES_TABLE_ID}
      empty={
        <KbEmptyState
          icon={IconFolders}
          title={t('kb-no-categories-found', 'No categories found')}
          description={t(
            'kb-no-categories-description',
            "This topic doesn't have any categories yet. Create your first category to start organizing articles.",
          )}
          action={
            <Button variant="outline" onClick={onCreate}>
              {t('kb-create-category', 'Create Category')}
            </Button>
          }
        />
      }
      commandBar={<CategoriesCommandBar />}
    />
  );
};
