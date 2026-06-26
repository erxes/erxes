import { IconPackage } from '@tabler/icons-react';
import { RecordTable, useQueryState } from 'erxes-ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { usePackages } from '../hooks/usePackages';
import { createPackageColumns } from './packageColumns';
import { PackageAddSheet } from './PackageAddSheet';
import { PackageCommandBar } from './PackageCommandBar';

export const PackagesRecordTable = () => {
  const { t } = useTranslation('product', { keyPrefix: 'package' });
  const [searchValue] = useQueryState<string>('searchValue');
  const [status] = useQueryState<string>('status');
  const [tags] = useQueryState<string[]>('tags');
  const packageColumns = useMemo(() => createPackageColumns(t), [t]);

  const { packages, loading, error } = usePackages({
    searchValue: searchValue || undefined,
    status: status || undefined,
    tagIds: tags?.length ? tags : undefined,
  });

  if (error) {
    return <div className="p-6 text-destructive">{error.message}</div>;
  }

  if (
    !loading &&
    (packages?.length ?? 0) === 0 &&
    !searchValue &&
    !status &&
    !tags?.length
  ) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full text-center">
        <IconPackage size={64} className="mb-4 text-muted-foreground" />
        <h3 className="mb-2 text-xl font-semibold">
          {t('no-packages', 'No packages yet')}
        </h3>
        <p className="max-w-md mb-6 text-muted-foreground">
          {t('empty-hint', 'Get started by creating your first package.')}
        </p>
        <PackageAddSheet />
      </div>
    );
  }

  return (
    <RecordTable.Provider
      columns={packageColumns}
      data={packages || []}
      className="h-full"
      stickyColumns={['checkbox', 'name']}
    >
      <RecordTable.Scroll>
        <RecordTable>
          <RecordTable.Header />
          <RecordTable.Body>
            {loading && <RecordTable.RowSkeleton rows={10} />}
            {!loading && (packages?.length ?? 0) > 0 && (
              <RecordTable.RowList />
            )}
          </RecordTable.Body>
        </RecordTable>
      </RecordTable.Scroll>
      <PackageCommandBar />
    </RecordTable.Provider>
  );
};
