import { IconListCheck } from '@tabler/icons-react';
import { RecordTable } from 'erxes-ui';
import { useBundleRules } from '@/products/settings/hooks/useBundleRules';
import { bundleRuleColumns } from './bundleRuleColumns';
import { BundleRuleCommandBar } from './BundleRuleCommandBar';
import { BundleRuleSheet } from './BundleRuleSheet';

export const BundleRuleRecordTable = () => {
  const { bundleRules, loading } = useBundleRules();

  if (!loading && (bundleRules?.length ?? 0) === 0) {
    return <EmptyStateRow />;
  }

  return (
    <RecordTable.Provider
      columns={bundleRuleColumns}
      data={bundleRules || []}
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
      <BundleRuleCommandBar />
    </RecordTable.Provider>
  );
};

function EmptyStateRow() {
  return (
    <div className="flex flex-col gap-2 justify-center items-center p-6 w-full h-full text-center">
      <IconListCheck size={64} stroke={1.5} className="text-muted-foreground" />
      <h2 className="text-lg font-semibold text-muted-foreground">
        No bundle rules yet
      </h2>
      <p className="mb-4 text-md text-muted-foreground">
        Get started by creating your first bundle rule.
      </p>
      <BundleRuleSheet />
    </div>
  );
}
