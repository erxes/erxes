import { RecordTable } from 'erxes-ui';
import { brandsColumns } from './BrandsColumns';
import { BrandsCommandBar } from './BrandsCommandBar';
import { useBrands } from '../hooks/useBrands';
import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';

export function BrandsRecordTable() {
  const { brands, loading } = useBrands();
  const { t } = useTranslation('settings', { keyPrefix: 'brands' });
  const columns = useMemo(() => brandsColumns(t), [t]);
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
