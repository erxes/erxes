import { useNavigate, Link } from 'react-router-dom';
import { ApolloCache, useMutation } from '@apollo/client';
import { ColumnDef } from '@tanstack/react-table';
import {
  IconPlus,
  IconRobot,
  IconAlignLeft,
  IconCpu,
  IconTool,
  IconCalendar,
  IconPencil,
  IconMessageCircle,
} from '@tabler/icons-react';
import {
  Badge,
  Button,
  Command,
  RecordTable,
  RecordTableInlineCell,
  RelativeDateDisplay,
  useConfirm,
} from 'erxes-ui';
import { MASTRA_AGENT_REMOVE, MASTRA_AGENT_UPDATE } from '~/graphql/mutations';
import {
  RowActionsMenu,
  ToggleDeleteMenuItems,
  enabledStatusColumn,
} from '~/components/RecordTableShared';
import { PermissionButton } from '~/components/PermissionButton';
import { ResourceIndexLayout } from '~/components/ResourceIndexLayout';
import { useMastraAgentList, IMastraAgentRow } from './useMastraAgentList';
import {
  agentMutationError,
  showAgentPermissionError,
  useAgentAccess,
} from './hooks/useAgentAccess';

type IAgent = IMastraAgentRow;

// Refresh the agent lists after a row mutation without prop-drilling a refetch
// through the table columns: invalidate every cached instance of both list
// fields (paginated table + dropdown/chat list). Shared by remove + toggle.
const agentListCacheUpdate = (cache: ApolloCache<unknown>) => {
  cache.evict({ fieldName: 'mastraAgentsMain' });
  cache.evict({ fieldName: 'mastraAgents' });
  cache.gc();
};

// ─── Create button (admin/owner only) ──────────────────────────────────────────

const CreateAgentButton = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const { canCreate } = useAgentAccess();
  return (
    <PermissionButton
      allowed={canCreate}
      onDenied={() => showAgentPermissionError('create')}
      onClick={() => navigate('/settings/erxes-agent/agents/new')}
    >
      {children}
    </PermissionButton>
  );
};

// ─── More menu cell ───────────────────────────────────────────────────────────

const AgentMoreCell = ({ agent }: { agent: IAgent }) => {
  const navigate = useNavigate();
  const { confirm } = useConfirm();
  const { canEdit, canRemove } = useAgentAccess();

  const [removeAgent] = useMutation(MASTRA_AGENT_REMOVE, {
    update: agentListCacheUpdate,
    onError: agentMutationError('delete'),
  });

  const [updateAgent] = useMutation(MASTRA_AGENT_UPDATE, {
    update: agentListCacheUpdate,
    onError: agentMutationError('edit'),
  });

  const handleDelete = () => {
    confirm({
      message: `Remove "${agent.name}"? This cannot be undone.`,
      options: { okLabel: 'Delete', cancelLabel: 'Cancel' },
    }).then(() => removeAgent({ variables: { _id: agent._id } }));
  };

  const handleToggle = () => {
    updateAgent({
      variables: { _id: agent._id, doc: { isEnabled: !agent.isEnabled } },
    });
  };

  return (
    <RowActionsMenu>
      <Command.Item asChild>
        <Button
          variant="ghost"
          size="sm"
          className="justify-start w-full h-8"
          onClick={() => navigate(`/erxes-agent/chat/${agent._id}`)}
        >
          <IconMessageCircle className="size-4" /> Chat
        </Button>
      </Command.Item>
      <Command.Item asChild>
        <PermissionButton
          variant="ghost"
          size="sm"
          className="justify-start w-full h-8"
          allowed={canEdit}
          onDenied={() => showAgentPermissionError('edit')}
          onClick={() =>
            navigate(`/settings/erxes-agent/agents/edit/${agent._id}`)
          }
        >
          <IconPencil className="size-4" /> Edit
        </PermissionButton>
      </Command.Item>
      <ToggleDeleteMenuItems
        isEnabled={agent.isEnabled}
        onToggle={handleToggle}
        onDelete={handleDelete}
        toggleDisabled={!canEdit}
        deleteDisabled={!canRemove}
        onToggleDenied={() => showAgentPermissionError('edit')}
        onDeleteDenied={() => showAgentPermissionError('delete')}
      />
    </RowActionsMenu>
  );
};

// ─── Static data columns (no refetch dependency) ──────────────────────────────

const baseColumns: ColumnDef<IAgent>[] = [
  {
    id: 'name',
    accessorKey: 'name',
    header: () => <RecordTable.InlineHead icon={IconAlignLeft} label="Agent" />,
    cell: ({ row }) => {
      const { _id, name, agentId, description } = row.original;
      return (
        <RecordTableInlineCell>
          <Link
            to={`/settings/erxes-agent/agents/edit/${_id}`}
            className="font-medium hover:underline cursor-pointer"
          >
            {name}
          </Link>
          <div className="font-mono text-xs text-muted-foreground">
            {agentId}
          </div>
          {description && (
            <div className="text-xs text-muted-foreground line-clamp-1">
              {description}
            </div>
          )}
        </RecordTableInlineCell>
      );
    },
    size: 260,
  },
  {
    id: 'model',
    accessorKey: 'model',
    header: () => <RecordTable.InlineHead icon={IconCpu} label="Model" />,
    cell: ({ row }) => {
      const { provider, model } = row.original;
      return (
        <RecordTableInlineCell>
          <div className="text-xs text-muted-foreground">{provider}</div>
          <div className="font-mono text-xs">{model}</div>
        </RecordTableInlineCell>
      );
    },
    size: 200,
  },
  {
    id: 'tools',
    accessorKey: 'toolPolicy',
    header: () => (
      <RecordTable.InlineHead icon={IconTool} label="Tool access" />
    ),
    cell: ({ row }) => {
      const { toolPolicy, allowedTools } = row.original;
      const isRestricted = toolPolicy === 'custom';
      const count = allowedTools?.length ?? 0;
      return (
        <RecordTableInlineCell>
          {isRestricted ? (
            <Badge variant="secondary">
              {count > 0
                ? `${count} rule${count !== 1 ? 's' : ''}`
                : 'No tools'}
            </Badge>
          ) : (
            <Badge variant="success">All tools</Badge>
          )}
        </RecordTableInlineCell>
      );
    },
    size: 110,
  },
  enabledStatusColumn<IAgent>(),
  {
    id: 'createdAt',
    accessorKey: 'createdAt',
    header: () => (
      <RecordTable.InlineHead icon={IconCalendar} label="Created" />
    ),
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

// Row actions self-invalidate the list cache, so columns don't depend on refetch.
const columns: ColumnDef<IAgent>[] = [
  {
    id: 'more',
    cell: ({ row }) => <AgentMoreCell agent={row.original} />,
    size: 33,
  },
  RecordTable.checkboxColumn as ColumnDef<IAgent>,
  ...baseColumns,
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export const AgentsIndexPage = () => {
  const { agentsList, loading, pageInfo, handleFetchMore } =
    useMastraAgentList();

  return (
    <ResourceIndexLayout<IAgent>
      icon={IconRobot}
      title="Agents"
      rootPath="/settings/erxes-agent/agents"
      sessionKey="erxes_agent_agents"
      columns={columns}
      data={agentsList}
      loading={loading}
      skeletonRows={20}
      pageInfo={pageInfo}
      onFetchMore={handleFetchMore}
      headerExtra={
        <CreateAgentButton>
          <IconPlus /> New Agent
        </CreateAgentButton>
      }
      empty={{
        title: 'No agents yet',
        description: 'Create your first Mastra AI agent to get started.',
        action: (
          <CreateAgentButton>
            <IconPlus /> Create Agent
          </CreateAgentButton>
        ),
      }}
    />
  );
};
