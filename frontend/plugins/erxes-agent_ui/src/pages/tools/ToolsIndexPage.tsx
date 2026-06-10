import { useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import { ColumnDef } from '@tanstack/react-table';
import {
  IconPlus,
  IconTool,
  IconPencil,
  IconTrash,
  IconRefresh,
  IconAlignLeft,
  IconTag,
  IconCode,
  IconToggleRight,
  IconCalendar,
} from '@tabler/icons-react';
import {
  Badge,
  Breadcrumb,
  Button,
  Combobox,
  Command,
  Empty,
  Popover,
  RecordTable,
  RecordTableInlineCell,
  RelativeDateDisplay,
  Separator,
  Tooltip,
  useConfirm,
  useToast,
} from 'erxes-ui';
import { PageHeader } from 'ui-modules';
import { MASTRA_TOOLS } from '~/graphql/queries';
import { MASTRA_TOOL_REMOVE, MASTRA_AUTO_CREATE_TOOLS } from '~/graphql/mutations';
import { useMastraToolList, IMastraToolRow } from './useMastraToolList';

type ITool = IMastraToolRow;

// ─── More menu cell ───────────────────────────────────────────────────────────

const ToolMoreCell = ({
  tool,
  refetch,
}: {
  tool: ITool;
  refetch: () => void;
}) => {
  const navigate = useNavigate();
  const { confirm } = useConfirm();

  const [removeTool] = useMutation(MASTRA_TOOL_REMOVE, {
    // Keep the agent form's full tool list fresh too, then refresh this list.
    refetchQueries: [{ query: MASTRA_TOOLS }],
    onCompleted: () => refetch(),
  });

  const handleDelete = () =>
    confirm({
      message: `Remove "${tool.name}"? Agents using this tool will lose access to it.`,
      options: { okLabel: 'Delete', cancelLabel: 'Cancel' },
    }).then(() => removeTool({ variables: { _id: tool._id } }));

  return (
    <Popover>
      <Popover.Trigger asChild>
        <RecordTable.MoreButton className="w-full h-full" />
      </Popover.Trigger>
      <Combobox.Content
        side="right"
        align="start"
        avoidCollisions={false}
        className="w-40 min-w-0 [&>button]:cursor-pointer"
        onClick={(e) => e.stopPropagation()}
      >
        <Command>
          <Command.List>
            <Command.Item asChild>
              <Button
                variant="ghost"
                size="sm"
                className="justify-start w-full h-8"
                onClick={() =>
                  navigate(`/settings/erxes-agent/tools/edit/${tool._id}`)
                }
              >
                <IconPencil className="size-4" /> Edit
              </Button>
            </Command.Item>
            <Command.Item asChild>
              <Button
                variant="ghost"
                size="sm"
                className="justify-start w-full h-8 text-destructive"
                onClick={handleDelete}
              >
                <IconTrash className="size-4" /> Delete
              </Button>
            </Command.Item>
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
};

// ─── Static data columns (no refetch dependency) ──────────────────────────────

const baseColumns: ColumnDef<ITool>[] = [
  {
    id: 'name',
    accessorKey: 'name',
    header: () => <RecordTable.InlineHead icon={IconAlignLeft} label="Tool" />,
    cell: ({ row }) => {
      const { _id, name, toolId } = row.original;
      return (
        <RecordTableInlineCell>
          <Link
            to={`/settings/erxes-agent/tools/edit/${_id}`}
            className="font-medium hover:underline cursor-pointer"
          >
            {name}
          </Link>
          <div className="font-mono text-xs text-muted-foreground">{toolId}</div>
        </RecordTableInlineCell>
      );
    },
    size: 240,
  },
  {
    id: 'type',
    accessorKey: 'type',
    header: () => <RecordTable.InlineHead icon={IconTag} label="Type" />,
    cell: ({ cell }) => {
      const type = cell.getValue() as string;
      return (
        <RecordTableInlineCell>
          <Badge variant={type === 'builtin' ? 'default' : 'secondary'} className="capitalize">
            {type}
          </Badge>
        </RecordTableInlineCell>
      );
    },
    size: 90,
  },
  {
    id: 'operation',
    accessorKey: 'erxesPlugin',
    header: () => <RecordTable.InlineHead icon={IconCode} label="Operation" />,
    cell: ({ row }) => {
      const { type, erxesPlugin, erxesOperation, erxesOperationType, builtinType } =
        row.original;
      return (
        <RecordTableInlineCell>
          {type === 'erxes' ? (
            <div>
              <div className="text-xs text-muted-foreground">{erxesPlugin}</div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-sm font-mono ${
                    erxesOperationType === 'mutation'
                      ? 'bg-warning/10 text-warning'
                      : 'bg-info/10 text-info'
                  }`}
                >
                  {erxesOperationType}
                </span>
                <span className="text-xs font-mono text-muted-foreground">
                  {erxesOperation}
                </span>
              </div>
            </div>
          ) : (
            <span className="text-xs font-mono text-muted-foreground">
              {builtinType || '—'}
            </span>
          )}
        </RecordTableInlineCell>
      );
    },
    size: 220,
  },
  {
    id: 'description',
    accessorKey: 'description',
    header: () => <RecordTable.InlineHead icon={IconAlignLeft} label="Description" />,
    cell: ({ cell }) => {
      const desc = cell.getValue() as string | undefined;
      return (
        <RecordTableInlineCell>
          {desc ? (
            <p className="text-xs text-muted-foreground line-clamp-2">{desc}</p>
          ) : (
            <span className="text-xs text-muted-foreground">—</span>
          )}
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'status',
    accessorKey: 'isEnabled',
    header: () => <RecordTable.InlineHead icon={IconToggleRight} label="Status" />,
    cell: ({ cell }) => {
      const isEnabled = cell.getValue() as boolean;
      return (
        <RecordTableInlineCell>
          <Badge variant={isEnabled ? 'success' : 'secondary'}>
            {isEnabled ? 'Active' : 'Disabled'}
          </Badge>
        </RecordTableInlineCell>
      );
    },
    size: 100,
  },
  {
    id: 'createdAt',
    accessorKey: 'createdAt',
    header: () => <RecordTable.InlineHead icon={IconCalendar} label="Created" />,
    cell: ({ cell }) => (
      <RelativeDateDisplay value={cell.getValue() as string} asChild>
        <RecordTableInlineCell>
          <RelativeDateDisplay.Value value={cell.getValue() as string} />
        </RecordTableInlineCell>
      </RelativeDateDisplay>
    ),
    size: 130,
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export const ToolsIndexPage = () => {
  const { toast } = useToast();
  const { toolsList, loading, pageInfo, handleFetchMore, refetch } =
    useMastraToolList();

  // The delete action lives inside a column cell, so columns close over refetch.
  const columns = useMemo<ColumnDef<ITool>[]>(
    () => [
      {
        id: 'more',
        cell: ({ row }) => <ToolMoreCell tool={row.original} refetch={refetch} />,
        size: 33,
      },
      RecordTable.checkboxColumn as ColumnDef<ITool>,
      ...baseColumns,
    ],
    [refetch],
  );

  const [autoCreate, { loading: autoCreating }] = useMutation(
    MASTRA_AUTO_CREATE_TOOLS,
    {
      // Refresh the agent form's full list, then re-pull this paginated list.
      refetchQueries: [{ query: MASTRA_TOOLS }],
      onCompleted: (res) => {
        const r = res?.mastraAutoCreateTools;
        if (r)
          toast({
            title: 'Tools synced',
            description: `Created ${r.created} · Updated ${r.updated ?? 0} · Removed ${r.removed ?? 0} · Total ${r.total}`,
            variant: 'success',
          });
        refetch();
      },
      onError: (err) =>
        toast({
          title: 'Auto-create failed',
          description: err.message,
          variant: 'destructive',
        }),
    },
  );

  return (
    <div className="flex flex-col h-full">
      <PageHeader>
        <PageHeader.Start>
          <Breadcrumb>
            <Breadcrumb.List className="gap-1">
              <Breadcrumb.Item>
                <Button variant="ghost" asChild>
                  <Link to="/settings/erxes-agent/tools">
                    <IconTool />
                    Tools
                  </Link>
                </Button>
              </Breadcrumb.Item>
            </Breadcrumb.List>
          </Breadcrumb>
          <Separator.Inline />
          <PageHeader.FavoriteToggleButton />
        </PageHeader.Start>
        <PageHeader.End>
          <Tooltip.Provider>
            <Tooltip>
              <Tooltip.Trigger asChild>
                <Button
                  variant="outline"
                  onClick={() => autoCreate()}
                  disabled={autoCreating}
                >
                  <IconRefresh className={autoCreating ? 'animate-spin' : ''} />
                  {autoCreating ? 'Creating…' : 'Auto-create from erxes'}
                </Button>
              </Tooltip.Trigger>
              <Tooltip.Content>
                Discovers all erxes GraphQL queries &amp; mutations and creates a tool
                for each one (skips ClientPortal and duplicates).
              </Tooltip.Content>
            </Tooltip>
          </Tooltip.Provider>
          <Button asChild>
            <Link to="/settings/erxes-agent/tools/new">
              <IconPlus /> New Tool
            </Link>
          </Button>
        </PageHeader.End>
      </PageHeader>

      {!loading && toolsList.length === 0 ? (
        <div className="flex-1 flex items-center justify-center p-4">
          <Empty className="border border-dashed max-w-sm w-full">
            <Empty.Header>
              <Empty.Media variant="icon">
                <IconTool />
              </Empty.Media>
              <Empty.Title>No tools yet</Empty.Title>
              <Empty.Description>
                Add built-in tools or wrap any erxes GraphQL operation.
              </Empty.Description>
            </Empty.Header>
            <Empty.Content>
              <Button asChild>
                <Link to="/settings/erxes-agent/tools/new">
                  <IconPlus /> Add Tool
                </Link>
              </Button>
            </Empty.Content>
          </Empty>
        </div>
      ) : (
        <div className="flex-1 min-h-0">
          <RecordTable.Provider
            columns={columns}
            data={toolsList}
            className="m-3"
            stickyColumns={['more', 'checkbox', 'name']}
          >
            <RecordTable.CursorProvider
              hasPreviousPage={pageInfo.hasPreviousPage}
              hasNextPage={pageInfo.hasNextPage}
              loading={loading}
              dataLength={toolsList.length}
              sessionKey="erxes_agent_tools"
            >
              <RecordTable>
                <RecordTable.Header />
                <RecordTable.Body>
                  <RecordTable.CursorBackwardSkeleton
                    handleFetchMore={handleFetchMore}
                  />
                  {loading && toolsList.length === 0 ? (
                    <RecordTable.RowSkeleton rows={20} />
                  ) : (
                    <RecordTable.RowList />
                  )}
                  <RecordTable.CursorForwardSkeleton
                    handleFetchMore={handleFetchMore}
                  />
                </RecordTable.Body>
              </RecordTable>
            </RecordTable.CursorProvider>
          </RecordTable.Provider>
        </div>
      )}
    </div>
  );
};
