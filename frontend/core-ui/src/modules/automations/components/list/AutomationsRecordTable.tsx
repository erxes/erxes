import { getAutomationColumns } from '@/automations/components/list/AutomationColumns';
import { AutomationRecordTableFilters } from '@/automations/components/list/filters/AutomationRecordTableFilters';
import { useAutomationsRecordTable } from '@/automations/hooks/useAutomationsRecordTable';
import { IconAffiliate, IconSettings } from '@tabler/icons-react';
import {
  Breadcrumb,
  Button,
  RecordTable,
  Separator,
  Spinner,
  Kbd,
  useScopedHotkeys,
} from 'erxes-ui';
import { Link } from 'react-router-dom';
import { FavoriteToggleIconButton, PageHeader } from 'ui-modules';
import { AutomationRecordTableCommandBar } from '@/automations/components/list/AutomationRecordTableCommandBar';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { AutomationsHotKeyScope } from '@/automations/types';
import { useNavigate } from 'react-router-dom';

export const AutomationsRecordTable = () => {
  const {
    list,
    loading,
    totalCount,
    hasNextPage,
    handleFetchMore,
    hasPreviousPage,
  } = useAutomationsRecordTable();

  const { t } = useTranslation('automations');
  const columns = useMemo(() => getAutomationColumns(t), [t]);
  const navigate = useNavigate();
  useScopedHotkeys(
    `c`,
    () => navigate('/automations/create'),
    AutomationsHotKeyScope.AutomationsPage,
  );
  if (loading) {
    return <Spinner />;
  }

  return (
    <>
      <PageHeader>
        <PageHeader.Start>
          <Breadcrumb>
            <Breadcrumb.List className="gap-1">
              <Breadcrumb.Item>
                <Button variant="ghost">
                  <IconAffiliate />
                  {t('automations')}
                </Button>
              </Breadcrumb.Item>
            </Breadcrumb.List>
          </Breadcrumb>
          <Separator.Inline /> <FavoriteToggleIconButton />
        </PageHeader.Start>
        <PageHeader.End>
          <Button variant="outline" asChild>
            <Link to="/settings/automations">
              <IconSettings />
              {t('go-to-settings')}
            </Link>
          </Button>
          <Button asChild>
            <Link to={'/automations/create'}>
              {t('create')}
              <Kbd>C</Kbd>
            </Link>
          </Button>
        </PageHeader.End>
      </PageHeader>
      <AutomationRecordTableFilters loading={loading} totalCount={totalCount} />
      <RecordTable.Provider
        columns={columns}
        data={list}
        stickyColumns={['more', 'checkbox', 'name']}
        className="m-3"
      >
        <RecordTable.CursorProvider
          hasPreviousPage={hasPreviousPage}
          hasNextPage={hasNextPage}
          dataLength={list?.length}
          sessionKey="automations_cursor"
        >
          <RecordTable className="w-full">
            <RecordTable.Header />
            <RecordTable.Body>
              <RecordTable.CursorBackwardSkeleton
                handleFetchMore={handleFetchMore}
              />
              {loading && <RecordTable.RowSkeleton rows={40} />}
              <RecordTable.RowList />
              <RecordTable.CursorForwardSkeleton
                handleFetchMore={handleFetchMore}
              />
            </RecordTable.Body>
          </RecordTable>
        </RecordTable.CursorProvider>
        <AutomationRecordTableCommandBar />
      </RecordTable.Provider>
    </>
  );
};
