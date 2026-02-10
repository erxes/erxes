import { IconFilter } from '@tabler/icons-react';
import { RecordTable } from 'erxes-ui';
import { useBundleConditions } from '@/products/settings/hooks/useBundleConditions';
import { useBundleConditionsVariables } from '@/products/settings/hooks/useBundleConditionsVariables';
import { bundleConditionColumns } from './bundleConditionColumns';
import { BundleConditionCommandBar } from './BundleConditionCommandBar';
import { BundleConditionSheet } from './BundleConditionSheet';

export const BundleConditionRecordTable = () => {
  const variables = useBundleConditionsVariables();
  const { bundleConditions, loading } = useBundleConditions(variables);

  if (!loading && (bundleConditions?.length ?? 0) === 0) {
    return <EmptyStateRow />;
  }

  return (
    <RecordTable.Provider
      columns={bundleConditionColumns}
      data={bundleConditions || []}
      className="h-full"
      stickyColumns={['more', 'checkbox', 'name']}
    >
      <RecordTable.Scroll>
        <RecordTable>
          <RecordTable.Header />
          <RecordTable.Body>
            {loading && <RecordTable.RowSkeleton rows={10} />}
            <RecordTable.RowList />
          </RecordTable.Body>
        </RecordTable>
      </RecordTable.Scroll>
      <BundleConditionCommandBar />
    </RecordTable.Provider>
  );
};

function EmptyStateRow() {
  return (
    <div className="flex flex-col gap-2 justify-center items-center p-6 w-full h-full text-center">
      <IconFilter size={64} stroke={1.5} className="text-muted-foreground" />
      <h2 className="text-lg font-semibold text-muted-foreground">
        No bundle conditions yet
      </h2>
      <p className="mb-4 text-md text-muted-foreground">
        Get started by creating your first bundle condition.
      </p>
      <BundleConditionSheet />
    </div>
  );
}
