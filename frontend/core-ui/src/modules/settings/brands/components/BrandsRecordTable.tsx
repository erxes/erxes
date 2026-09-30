import { RecordTable, Empty } from 'erxes-ui';
import { brandsColumns } from './BrandsColumns';
import { BrandsCommandBar } from './BrandsCommandBar';
import { useBrands } from '../hooks/useBrands';
import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';
import { IconBook, IconBrandSafari } from '@tabler/icons-react';
import { EmptyState } from '@/settings/components/EmptyState';

export function BrandsRecordTable() {
  const { brands, loading } = useBrands();
  const { t } = useTranslation('settings', { keyPrefix: 'brands' });
  const columns = useMemo(() => brandsColumns(t), [t]);

  const isEmpty = !loading && (!brands || brands.length === 0);

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
        {isEmpty && (
          <EmptyState icon={IconBrandSafari} title={t('no-brands-found')} />
        )}
      </RecordTable.Scroll>
      <BrandsCommandBar />
    </RecordTable.Provider>
  );
}
