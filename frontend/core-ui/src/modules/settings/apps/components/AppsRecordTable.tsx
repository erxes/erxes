import { IconArchiveOff } from '@tabler/icons-react';
import { RecordTable } from 'erxes-ui';
import { appsSettingsColumns } from './table/AppsSettingsColumns';
import { appsMoreColumn } from './table/AppsMoreColumn';
import { AppsCommandBar } from './AppsCommandBar';
import { AppsAddRow } from './AppsAddRow';
import { useApps } from '../hooks/useApps';
import { useMemo } from 'react';
import { useAtomValue } from 'jotai';
import { isAddingAppAtom } from '../state';
import { EmptyState } from '@/settings/components/EmptyState';
import { useTranslation } from 'react-i18next';

export function AppsRecordTable() {
  const { t } = useTranslation('settings', { keyPrefix: 'apps' });
  const { apps, loading, error } = useApps();
  const { t: tAppTokens } = useTranslation('settings', {
    keyPrefix: 'app-tokens',
  });
  const isAddingApp = useAtomValue(isAddingAppAtom);
  const columns = useMemo(
    () => [...appsSettingsColumns(t), appsMoreColumn],
    [t],
  );

  const isEmpty = !loading && !error && !isAddingApp && apps.length === 0;

  return (
    <RecordTable.Provider
      data={apps}
      columns={columns}
      stickyColumns={['more', 'checkbox', 'name']}
      className="m-3"
    >
      <RecordTable.Scroll>
        <RecordTable>
          <RecordTable.Header />
          <RecordTable.Body>
            {isAddingApp && <AppsAddRow />}
            <RecordTable.RowList />
            {loading && <RecordTable.RowSkeleton rows={20} />}
          </RecordTable.Body>
        </RecordTable>
        {isEmpty && (
          <EmptyState
            icon={IconArchiveOff}
            title={tAppTokens('no-app-tokens-found')}
          />
        )}
      </RecordTable.Scroll>
      <AppsCommandBar />
    </RecordTable.Provider>
  );
}
