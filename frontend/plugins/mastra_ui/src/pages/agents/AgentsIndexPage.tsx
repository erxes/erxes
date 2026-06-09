import { useState } from 'react';
import { IconPlus, IconRobot, IconPencil, IconTrash, IconMessageCircle } from '@tabler/icons-react';
import { useQuery, useMutation } from '@apollo/client';
import {
  AlertDialog,
  Badge,
  Breadcrumb,
  Button,
  Empty,
  Separator,
  Skeleton,
  Switch,
  Table,
  Tooltip,
} from 'erxes-ui';
import { PageHeader } from 'ui-modules';
import { Link } from 'react-router-dom';
import { MASTRA_AGENTS } from '~/graphql/queries';
import { MASTRA_AGENT_REMOVE, MASTRA_AGENT_UPDATE } from '~/graphql/mutations';

const AgentRow = ({ agent, onToggle, onRemove }: { agent: any; onToggle: (a: any) => void; onRemove: (a: any) => void }) => {
  const [open, setOpen] = useState(false);

  return (
    <Table.Row>
      <Table.Cell className="px-3 py-2">
        <div className="font-medium text-sm">{agent.name}</div>
        <div className="font-mono text-xs text-muted-foreground mt-0.5">{agent.agentId}</div>
        {agent.description && (
          <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{agent.description}</div>
        )}
      </Table.Cell>
      <Table.Cell className="px-3 py-2">
        <div className="text-sm">{agent.provider}</div>
        <div className="text-xs text-muted-foreground font-mono">{agent.model}</div>
      </Table.Cell>
      <Table.Cell className="px-3 py-2">
        {agent.toolIds?.length > 0 ? (
          <Badge variant="secondary">{agent.toolIds.length} tool{agent.toolIds.length !== 1 ? 's' : ''}</Badge>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        )}
      </Table.Cell>
      <Table.Cell className="px-3 py-2">
        <Tooltip.Provider>
          <Tooltip>
            <Tooltip.Trigger asChild>
              <div>
                <Switch
                  checked={agent.isEnabled}
                  onCheckedChange={() => onToggle(agent)}
                />
              </div>
            </Tooltip.Trigger>
            <Tooltip.Content>{agent.isEnabled ? 'Disable agent' : 'Enable agent'}</Tooltip.Content>
          </Tooltip>
        </Tooltip.Provider>
      </Table.Cell>
      <Table.Cell className="px-3 py-2">
        <div className="flex items-center gap-1">
          <Tooltip.Provider>
            <Tooltip>
              <Tooltip.Trigger asChild>
                <Button variant="ghost" size="icon" className="size-7" asChild>
                  <Link to={`/mastra/chat/${agent._id}`}>
                    <IconMessageCircle className="size-3.5" />
                  </Link>
                </Button>
              </Tooltip.Trigger>
              <Tooltip.Content>Chat</Tooltip.Content>
            </Tooltip>
          </Tooltip.Provider>

          <Tooltip.Provider>
            <Tooltip>
              <Tooltip.Trigger asChild>
                <Button variant="ghost" size="icon" className="size-7" asChild>
                  <Link to={`/settings/mastra/agents/edit/${agent._id}`}>
                    <IconPencil className="size-3.5" />
                  </Link>
                </Button>
              </Tooltip.Trigger>
              <Tooltip.Content>Edit</Tooltip.Content>
            </Tooltip>
          </Tooltip.Provider>

          <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialog.Trigger asChild>
              <Tooltip.Provider>
                <Tooltip>
                  <Tooltip.Trigger asChild>
                    <Button variant="ghost" size="icon" className="size-7 text-destructive hover:text-destructive">
                      <IconTrash className="size-3.5" />
                    </Button>
                  </Tooltip.Trigger>
                  <Tooltip.Content>Delete</Tooltip.Content>
                </Tooltip>
              </Tooltip.Provider>
            </AlertDialog.Trigger>
            <AlertDialog.Content>
              <AlertDialog.Header>
                <AlertDialog.Title>Delete agent</AlertDialog.Title>
                <AlertDialog.Description>
                  Remove <strong>{agent.name}</strong>? This cannot be undone.
                </AlertDialog.Description>
              </AlertDialog.Header>
              <AlertDialog.Footer>
                <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
                <AlertDialog.Action
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={() => onRemove(agent)}
                >
                  Delete
                </AlertDialog.Action>
              </AlertDialog.Footer>
            </AlertDialog.Content>
          </AlertDialog>
        </div>
      </Table.Cell>
    </Table.Row>
  );
};

export const AgentsIndexPage = () => {
  const { data, loading, refetch } = useQuery(MASTRA_AGENTS);
  const [removeAgent] = useMutation(MASTRA_AGENT_REMOVE, { onCompleted: () => refetch() });
  const [updateAgent] = useMutation(MASTRA_AGENT_UPDATE, { onCompleted: () => refetch() });

  const agents = data?.mastraAgents || [];

  const handleToggle = (agent: any) =>
    updateAgent({ variables: { _id: agent._id, doc: { isEnabled: !agent.isEnabled } } });

  const handleRemove = (agent: any) =>
    removeAgent({ variables: { _id: agent._id } });

  return (
    <div className="flex flex-col h-full">
      <PageHeader>
        <PageHeader.Start>
          <Breadcrumb>
            <Breadcrumb.List className="gap-1">
              <Breadcrumb.Item>
                <Button variant="ghost" asChild>
                  <Link to="/settings/mastra/agents">
                    <IconRobot />
                    Agents
                  </Link>
                </Button>
              </Breadcrumb.Item>
            </Breadcrumb.List>
          </Breadcrumb>
          <Separator.Inline />
          <PageHeader.FavoriteToggleButton />
        </PageHeader.Start>
        <PageHeader.End>
          <Button asChild>
            <Link to="/settings/mastra/agents/new">
              <IconPlus />
              New Agent
            </Link>
          </Button>
        </PageHeader.End>
      </PageHeader>

      <div className="flex-1 overflow-auto p-4">
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-md" />
            ))}
          </div>
        ) : agents.length === 0 ? (
          <Empty className="border border-dashed">
            <Empty.Header>
              <Empty.Media variant="icon">
                <IconRobot />
              </Empty.Media>
              <Empty.Title>No agents yet</Empty.Title>
              <Empty.Description>Create your first Mastra AI agent to get started.</Empty.Description>
            </Empty.Header>
            <Empty.Content>
              <Button asChild>
                <Link to="/settings/mastra/agents/new">
                  <IconPlus /> Create Agent
                </Link>
              </Button>
            </Empty.Content>
          </Empty>
        ) : (
          <Table>
            <Table.Header>
              <Table.Row className="hover:bg-transparent">
                <Table.Head className="px-3 w-2/5">Agent</Table.Head>
                <Table.Head className="px-3 w-1/5">Model</Table.Head>
                <Table.Head className="px-3 w-1/6">Tools</Table.Head>
                <Table.Head className="px-3 w-1/6">Enabled</Table.Head>
                <Table.Head className="px-3 w-1/6">Actions</Table.Head>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {agents.map((agent: any) => (
                <AgentRow
                  key={agent._id}
                  agent={agent}
                  onToggle={handleToggle}
                  onRemove={handleRemove}
                />
              ))}
            </Table.Body>
          </Table>
        )}
      </div>
    </div>
  );
};
