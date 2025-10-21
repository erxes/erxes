import { automationColumns } from '@/automations/components/list/AutomationColumns';
import { AutomationRecordTableFilters } from '@/automations/components/list/AutomationRecordTableFilters';
import { useAutomationsRecordTable } from '@/automations/hooks/useAutomationsRecordTable';
import { IconAffiliate, IconSettings } from '@tabler/icons-react';
import { Breadcrumb, Button, RecordTable, Separator, Spinner } from 'erxes-ui';
import { Link } from 'react-router-dom';
import { PageHeader } from 'ui-modules';

export const AutomationsRecordTable = () => {
  const {
    list,
    loading,
    totalCount,
    hasNextPage,
    handleFetchMore,
    hasPreviousPage,
  } = useAutomationsRecordTable();

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
                  Automations
                </Button>
              </Breadcrumb.Item>
            </Breadcrumb.List>
          </Breadcrumb>
          <Separator.Inline />
        </PageHeader.Start>
        <PageHeader.End>
          <Button variant="outline" asChild>
            <Link to="/settings/automations">
              <IconSettings />
              Go to settings
            </Link>
          </Button>
          <Button asChild>
            <Link to={'/automations/create'}>Add</Link>
          </Button>
        </PageHeader.End>
      </PageHeader>
      <AutomationRecordTableFilters loading={loading} totalCount={totalCount} />
      <RecordTable.Provider
        columns={automationColumns}
        data={list}
        stickyColumns={['more', 'checkbox', 'avatar', 'name']}
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
      </RecordTable.Provider>
    </>
  );
};
