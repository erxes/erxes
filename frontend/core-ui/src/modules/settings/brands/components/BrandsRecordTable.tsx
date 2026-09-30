import { IconChessKnightFilled, IconSearchOff } from '@tabler/icons-react';
import { Empty, RecordTable, useMultiQueryState } from 'erxes-ui';
import { brandsColumns } from './BrandsColumns';
import { BrandsCommandBar } from './BrandsCommandBar';
import { useBrands } from '../hooks/useBrands';
import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';

export function BrandsRecordTable() {
  const { brands, loading, error } = useBrands();
  const { t } = useTranslation('settings', { keyPrefix: 'brands' });
  const columns = useMemo(() => brandsColumns(t), [t]);
  const [queries] = useMultiQueryState<{ searchValue: string }>([
    'searchValue',
  ]);
  const isFiltered = !!queries?.searchValue;

  if (!loading && !error && !brands?.length) {
    return (
      <Empty className="m-3 min-h-[20rem]">
        <Empty.Header>
          <Empty.Media variant="icon">
            {isFiltered ? <IconSearchOff /> : <IconChessKnightFilled />}
          </Empty.Media>
          <Empty.Title>
            {isFiltered
              ? t('no-brands-match', 'No brands match')
              : t('no-brands-yet', 'No brands yet')}
          </Empty.Title>
          <Empty.Description>
            {isFiltered
              ? t(
                  'no-brands-match-description',
                  'Try a different search, or clear the filter.',
                )
              : t(
                  'no-brands-yet-description',
                  'Brands help you organize inboxes and channels. Create your first brand to get started.',
                )}
          </Empty.Description>
        </Empty.Header>
      </Empty>
    );
  }

  return (
    <RecordTable.Provider
      data={brands || []}
      columns={columns}
      stickyColumns={['more', 'checkbox', 'name']}
      className="m-3"
    >
      <RecordTable.Scroll>
        <RecordTable>
          <RecordTable.Header />
          <RecordTable.Body>
            <RecordTable.RowList />
            {loading && <RecordTable.RowSkeleton rows={30} />}
          </RecordTable.Body>
        </RecordTable>
      </RecordTable.Scroll>
      <BrandsCommandBar />
    </RecordTable.Provider>
  );
}
