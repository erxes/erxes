import { IconAlertCircle, IconFolders } from '@tabler/icons-react';
import { Button, Empty, RecordTable } from 'erxes-ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { CategoriesCommandBar } from '@/knowledgebase/categories/components/categories-command-bar/CategoriesCommandBar';
import { useCategoriesColumns } from '@/knowledgebase/categories/components/CategoriesColumns';
import { useCategories } from '@/knowledgebase/categories/hooks/useCategories';
import { sortCategoriesAsTree } from '@/knowledgebase/categories/utils/sortCategoriesAsTree';
import { CATEGORIES_TABLE_ID } from '@/knowledgebase/constants';

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

  if (error) {
    return (
      <Empty className="m-3 rounded-lg bg-sidebar">
        <Empty.Header>
          <Empty.Media variant="icon">
            <IconAlertCircle />
          </Empty.Media>
          <Empty.Title>{t('error')}</Empty.Title>
          <Empty.Description>{error.message}</Empty.Description>
        </Empty.Header>
      </Empty>
    );
  }

  if (!loading && rows.length === 0) {
    return (
      <Empty className="m-3 rounded-lg bg-sidebar">
        <Empty.Header>
          <Empty.Media variant="icon">
            <IconFolders />
          </Empty.Media>
          <Empty.Title>
            {t('kb-no-categories-found', 'No categories found')}
          </Empty.Title>
          <Empty.Description>
            {t(
              'kb-no-categories-description',
              "This topic doesn't have any categories yet. Create your first category to start organizing articles.",
            )}
          </Empty.Description>
        </Empty.Header>
        <Empty.Content>
          <Button variant="outline" onClick={onCreate}>
            {t('kb-create-category', 'Create Category')}
          </Button>
        </Empty.Content>
      </Empty>
    );
  }

  return (
    <RecordTable.Provider
      columns={columns}
      data={rows}
      stickyColumns={['more', 'checkbox', 'title']}
      className="m-3"
      tableId={CATEGORIES_TABLE_ID}
    >
      <RecordTable.Scroll>
        <RecordTable>
          <RecordTable.Header />
          <RecordTable.Body>
            {loading ? (
              <RecordTable.RowSkeleton rows={10} />
            ) : (
              <RecordTable.RowList />
            )}
          </RecordTable.Body>
        </RecordTable>
      </RecordTable.Scroll>
      <CategoriesCommandBar />
    </RecordTable.Provider>
  );
};
