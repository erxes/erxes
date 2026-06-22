import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Icon, IconPlus } from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/react-table';
import {
  Breadcrumb,
  Button,
  Empty,
  RecordTable,
  Separator,
} from 'erxes-ui';
import { PageHeader } from 'ui-modules';

interface PageInfo {
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

interface ResourceIndexLayoutProps<T> {
  icon: Icon;
  title: string;
  rootPath: string;
  sessionKey: string;
  columns: ColumnDef<T>[];
  data: T[];
  loading: boolean;
  stickyColumns?: string[];
  skeletonRows?: number;
  pageInfo?: PageInfo;
  onFetchMore?: () => void;
  newButton?: { to: string; label: string };
  empty: {
    icon?: Icon;
    title: string;
    description: ReactNode;
    action: ReactNode;
    className?: string;
  };
  headerExtra?: ReactNode;
}

// Shared shell for the plugin's resource index pages (agents, schedules,
// workflows, learnings): breadcrumb header with an optional new-button / extras,
// an empty-state, and the record table with its loading-skeleton switch.
export const ResourceIndexLayout = <T,>({
  icon: Icon,
  title,
  rootPath,
  sessionKey,
  columns,
  data,
  loading,
  stickyColumns = ['more', 'checkbox', 'name'],
  skeletonRows = 10,
  pageInfo,
  onFetchMore,
  newButton,
  empty,
  headerExtra,
}: ResourceIndexLayoutProps<T>) => {
  const EmptyIcon = empty.icon ?? Icon;

  return (
    <div className="flex flex-col h-full">
      <PageHeader>
        <PageHeader.Start>
          <Breadcrumb>
            <Breadcrumb.List className="gap-1">
              <Breadcrumb.Item>
                <Button variant="ghost" asChild>
                  <Link to={rootPath}>
                    <Icon />
                    {title}
                  </Link>
                </Button>
              </Breadcrumb.Item>
            </Breadcrumb.List>
          </Breadcrumb>
          <Separator.Inline />
          <PageHeader.FavoriteToggleButton />
        </PageHeader.Start>
        <PageHeader.End>
          {headerExtra}
          {newButton && (
            <Button asChild>
              <Link to={newButton.to}>
                <IconPlus /> {newButton.label}
              </Link>
            </Button>
          )}
        </PageHeader.End>
      </PageHeader>

      {!loading && data.length === 0 ? (
        <div className="flex-1 flex items-center justify-center p-4">
          <Empty
            className={`border border-dashed w-full ${empty.className ?? 'max-w-sm'}`}
          >
            <Empty.Header>
              <Empty.Media variant="icon">
                <EmptyIcon />
              </Empty.Media>
              <Empty.Title>{empty.title}</Empty.Title>
              <Empty.Description>{empty.description}</Empty.Description>
            </Empty.Header>
            <Empty.Content>{empty.action}</Empty.Content>
          </Empty>
        </div>
      ) : (
        <div className="flex-1 min-h-0">
          <RecordTable.Provider
            columns={columns}
            data={data}
            className="m-3"
            stickyColumns={stickyColumns}
          >
            <RecordTable.CursorProvider
              hasPreviousPage={pageInfo?.hasPreviousPage ?? false}
              hasNextPage={pageInfo?.hasNextPage ?? false}
              loading={loading}
              dataLength={data.length}
              sessionKey={sessionKey}
            >
              <RecordTable>
                <RecordTable.Header />
                <RecordTable.Body>
                  {onFetchMore && (
                    <RecordTable.CursorBackwardSkeleton
                      handleFetchMore={onFetchMore}
                    />
                  )}
                  {loading && data.length === 0 ? (
                    <RecordTable.RowSkeleton rows={skeletonRows} />
                  ) : (
                    <RecordTable.RowList />
                  )}
                  {onFetchMore && (
                    <RecordTable.CursorForwardSkeleton
                      handleFetchMore={onFetchMore}
                    />
                  )}
                </RecordTable.Body>
              </RecordTable>
            </RecordTable.CursorProvider>
          </RecordTable.Provider>
        </div>
      )}
    </div>
  );
};
