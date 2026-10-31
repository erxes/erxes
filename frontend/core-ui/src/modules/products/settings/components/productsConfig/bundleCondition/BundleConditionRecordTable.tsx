import { useTranslation } from 'react-i18next';
import { IconFilter, IconPlus } from '@tabler/icons-react';
import { Button, Kbd, RecordTable } from 'erxes-ui';
import { Can, useSidePanel } from 'ui-modules';
import { getModulePanelPath } from '@/side-panel/states/modulePanelState';
import { useBundleConditions } from '@/products/settings/hooks/useBundleConditions';
import { useBundleConditionsVariables } from '@/products/settings/hooks/useBundleConditionsVariables';
import { bundleConditionColumns } from './bundleConditionColumns';
import { BundleConditionCommandBar } from './BundleConditionCommandBar';
import { BUNDLE_CONDITION_CREATE_PANEL } from './BundleConditionSheet';

export const BundleConditionRecordTable = () => {
  const variables = useBundleConditionsVariables();
  const { bundleConditions, loading } = useBundleConditions(variables);
  const { t } = useTranslation('product', { keyPrefix: 'bundle-conditions' });

  if (!loading && (bundleConditions?.length ?? 0) === 0) {
    return <EmptyStateRow />;
  }

  return (
    <RecordTable.Provider
      columns={bundleConditionColumns(t)}
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
  const { openPath } = useSidePanel();
  const { t: tAdd } = useTranslation('product', { keyPrefix: 'add' });
  const { t } = useTranslation('product', { keyPrefix: 'bundle-conditions' });
  return (
    <div className="flex flex-col gap-2 justify-center items-center p-6 w-full h-full text-center">
      <IconFilter size={64} stroke={1.5} className="text-muted-foreground" />
      <h2 className="text-lg font-semibold text-muted-foreground">
        {t('empty-title')}
      </h2>
      <p className="mb-4 text-md text-muted-foreground">{t('empty-hint')}</p>
      <Can action="bundleConditionsManage">
        <Button
          onClick={() =>
            openPath(getModulePanelPath(BUNDLE_CONDITION_CREATE_PANEL))
          }
        >
          <IconPlus />
          {tAdd('add-bundle-condition')}
          <Kbd>C</Kbd>
        </Button>
      </Can>
    </div>
  );
}
