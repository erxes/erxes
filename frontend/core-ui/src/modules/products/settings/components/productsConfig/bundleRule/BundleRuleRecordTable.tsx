import { IconListCheck } from '@tabler/icons-react';
import { RecordTable } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useBundleRules } from '@/products/settings/hooks/useBundleRules';
import { bundleRuleColumns } from './bundleRuleColumns';
import { BundleRuleCommandBar } from './BundleRuleCommandBar';
import { BundleRuleSheet } from './BundleRuleSheet';

export const BundleRuleRecordTable = () => {
  const { t } = useTranslation('product');
  const { bundleRules, loading } = useBundleRules();

  if (!loading && (bundleRules?.length ?? 0) === 0) {
    return <EmptyStateRow />;
  }

  return (
    <RecordTable.Provider
      columns={bundleRuleColumns(t)}
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
  const { t } = useTranslation('product');
  return (
    <div className="flex flex-col gap-2 justify-center items-center p-6 w-full h-full text-center">
      <IconListCheck size={64} stroke={1.5} className="text-muted-foreground" />
      <h2 className="text-lg font-semibold text-muted-foreground">
        {t('no-bundle-rules-yet', 'No bundle rules yet')}
      </h2>
      <p className="mb-4 text-md text-muted-foreground">
        {t('get-started-bundle-rule', 'Get started by creating your first bundle rule.')}
      </p>
      <BundleRuleSheet />
    </div>
  );
}
