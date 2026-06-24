import { Button, Empty, RecordTable } from 'erxes-ui';
import { IconLayoutGrid } from '@tabler/icons-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useProductSimilarities } from '../hooks/useProductSimilarities';
import { SimilarityCommandBar } from './SimilarityCommandBar';
import { createSimilarityColumns } from './similarityColumns';

interface SimilarityListProps {
  onNew?: () => void;
}

export const SimilarityList = ({ onNew }: SimilarityListProps) => {
  const { t } = useTranslation('product', { keyPrefix: 'bulk-similarity' });
  const { similarities, loading } = useProductSimilarities();
  const similarityColumns = useMemo(() => createSimilarityColumns(t), [t]);

  if (!loading && !similarities.length) {
    return (
      <Empty className="my-8">
        <Empty.Header>
          <Empty.Media variant="icon">
            <IconLayoutGrid />
          </Empty.Media>
          <Empty.Title>
            {t('no-similarity-groups', 'No similarity groups yet')}
          </Empty.Title>
          <Empty.Description>
            {t(
              'empty-description',
              'Create a group to generate product variants in bulk from shared base info and property fields.',
            )}
          </Empty.Description>
        </Empty.Header>
        {onNew && (
          <Empty.Content>
            <Button onClick={onNew}>{t('new-similarity', 'New similarity')}</Button>
          </Empty.Content>
        )}
      </Empty>
    );
  }

  return (
    <RecordTable.Provider
      columns={similarityColumns}
      data={similarities}
      className="h-full"
      stickyColumns={['checkbox', 'name']}
    >
      <RecordTable.Scroll>
        <RecordTable>
          <RecordTable.Header />
          <RecordTable.Body>
            {loading && <RecordTable.RowSkeleton rows={10} />}
            {!loading && similarities.length > 0 && <RecordTable.RowList />}
          </RecordTable.Body>
        </RecordTable>
      </RecordTable.Scroll>
      <SimilarityCommandBar />
    </RecordTable.Provider>
  );
};
