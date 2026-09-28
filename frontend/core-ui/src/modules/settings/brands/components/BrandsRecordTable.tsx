import { IconChessKnightFilled } from '@tabler/icons-react';
import { Empty, RecordTable } from 'erxes-ui';
import { brandsColumns } from './BrandsColumns';
import { BrandsCommandBar } from './BrandsCommandBar';
import { useBrands } from '../hooks/useBrands';
import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';

export function BrandsRecordTable() {
  const { brands, loading, error } = useBrands();
  const { t } = useTranslation('settings', { keyPrefix: 'brands' });
  const columns = useMemo(() => brandsColumns(t), [t]);

  if (!loading && !error && !brands?.length) {
    return (
      <Empty className="m-3 min-h-[20rem]">
        <Empty.Header>
          <Empty.Media variant="icon">
            <IconChessKnightFilled />
          </Empty.Media>
          <Empty.Title>No brands yet</Empty.Title>
          <Empty.Description>
            Brands help you organize inboxes and channels. Create your first
            brand to get started.
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
