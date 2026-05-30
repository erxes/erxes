import { IconPackage } from '@tabler/icons-react';
import { RecordTable, useQueryState } from 'erxes-ui';
import { usePackages } from '../hooks/usePackages';
import { packageColumns } from './packageColumns';
import { PackageAddSheet } from './PackageAddSheet';
import { PackageCommandBar } from './PackageCommandBar';

export const PackagesRecordTable = () => {
  const [searchValue] = useQueryState<string>('searchValue');
  const [status] = useQueryState<string>('status');

  const { packages, loading, error } = usePackages({
    searchValue: searchValue || undefined,
    status: status || undefined,
  });

  if (error) {
    return <div className="p-6 text-destructive">{error.message}</div>;
  }

  if (!loading && (packages?.length ?? 0) === 0 && !searchValue && !status) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full text-center">
        <IconPackage size={64} className="mb-4 text-muted-foreground" />
        <h3 className="mb-2 text-xl font-semibold">No packages yet</h3>
        <p className="max-w-md mb-6 text-muted-foreground">
          Get started by creating your first package.
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
