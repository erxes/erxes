import {
  Badge,
  Button,
  Empty,
  Input,
  Select,
  Spinner,
  Table,
  toast,
  useConfirm,
} from 'erxes-ui';
import { IconEdit, IconPlus, IconTrash, IconUsers } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { useMutation, useQuery } from 'erxes-sdk/react';
import {
  api,
  errorMessage,
  PER_PAGE,
  type AgentStatus,
  type StoredAgent,
} from './api';
import {
  AGENT_STATUS_OPTIONS,
  AGENT_STATUSES,
  describeReward,
  findAgentStatus,
} from './agentForm';
import { AgentSheet } from './AgentSheet';

const ALL_STATUSES = 'all';

export const LoyaltyAgents = () => {
  const [number, setNumber] = useState('');
  const [status, setStatus] = useState<AgentStatus>();
  const [page, setPage] = useState(1);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<StoredAgent | null>(null);

  const {
    data: list,
    error,
    loading,
    refetch,
  } = useQuery(api.agents.list, { number, status, page, perPage: PER_PAGE });
  const { mutate: remove } = useMutation(api.agents.remove);
  const { confirm } = useConfirm();

  const totalCount = list?.totalCount ?? 0;
  const pageCount = Math.max(1, Math.ceil(totalCount / PER_PAGE));
  const filtered = number !== '' || status !== undefined;

  useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [page, pageCount]);

  const openAdd = () => {
    setEditing(null);
    setSheetOpen(true);
  };

  const openEdit = (agent: StoredAgent) => {
    setEditing(agent);
    setSheetOpen(true);
  };

  const removeAgent = async (agent: StoredAgent) => {
    try {
      await remove({ _id: agent._id });
      toast({ title: `Deleted agent ${agent.number}`, variant: 'success' });
    } catch (err) {
      toast({
        title: 'Could not delete agent',
        description: errorMessage(err),
        variant: 'destructive',
      });
    }
  };

  const askRemove = (agent: StoredAgent) => {
    confirm({
      message: `Delete agent ${agent.number}? This cannot be undone.`,
      options: { okLabel: 'Delete', variants: { ok: 'destructive' } },
    }).then(() => removeAgent(agent));
  };

  return (
    <div className="flex flex-col gap-4 p-5 overflow-auto h-full">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold">Agents</h1>
          <p className="text-sm text-muted-foreground">
            Customers and companies that sell for you and earn a return, or buy
            at a prepaid or discount rate.
          </p>
        </div>
        <Button onClick={openAdd}>
          <IconPlus />
          Add agent
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Input
          className="max-w-xs"
          placeholder="Search by number"
          value={number}
          onChange={(event) => {
            setNumber(event.target.value);
            setPage(1);
          }}
        />
        <Select
          value={status ?? ALL_STATUSES}
          onValueChange={(value) => {
            setStatus(findAgentStatus(value));
            setPage(1);
          }}
        >
          <Select.Trigger className="w-40">
            <Select.Value />
          </Select.Trigger>
          <Select.Content>
            <Select.Item value={ALL_STATUSES}>All statuses</Select.Item>
            {AGENT_STATUSES.map((option) => (
              <Select.Item key={option} value={option}>
                {AGENT_STATUS_OPTIONS[option].label}
              </Select.Item>
            ))}
          </Select.Content>
        </Select>
      </div>

      {error && (
        <div className="flex items-center justify-between gap-2 rounded border border-destructive/30 p-3 text-sm">
          <span className="text-destructive">{error}</span>
          <Button variant="outline" size="sm" onClick={refetch}>
            Try again
          </Button>
        </div>
      )}

      {!list && !error && (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      )}

      {list && list.list.length === 0 && (
        <Empty>
          <Empty.Header>
            <Empty.Media>
              <IconUsers />
            </Empty.Media>
            <Empty.Title>
              {filtered ? 'No agents match these filters' : 'No agents yet'}
            </Empty.Title>
            <Empty.Description>
              {filtered
                ? 'Clear the search or status filter to see every agent.'
                : 'Add the first agent to start tracking returns and discounts.'}
            </Empty.Description>
          </Empty.Header>
          {!filtered && (
            <Empty.Content>
              <Button onClick={openAdd}>Add agent</Button>
            </Empty.Content>
          )}
        </Empty>
      )}

      {list && list.list.length > 0 && (
        <>
          <div className={loading ? 'opacity-50' : undefined}>
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.Head>Number</Table.Head>
                  <Table.Head>Status</Table.Head>
                  <Table.Head>Return or discount</Table.Head>
                  <Table.Head>Created</Table.Head>
                  <Table.Head>
                    <span className="sr-only">Actions</span>
                  </Table.Head>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {list.list.map((agent) => (
                  <Table.Row key={agent._id}>
                    <Table.Cell className="font-medium">
                      {agent.number}
                    </Table.Cell>
                    <Table.Cell>
                      <Badge variant={AGENT_STATUS_OPTIONS[agent.status].variant}>
                        {AGENT_STATUS_OPTIONS[agent.status].label}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell>
                      <span className="rounded-full bg-lime-100 px-2.5 py-0.5 text-xs font-medium text-lime-800 ring-1 ring-lime-300">
                        {describeReward(agent)}
                      </span>
                    </Table.Cell>
                    <Table.Cell className="text-muted-foreground">
                      {new Date(agent.createdAt).toLocaleDateString()}
                    </Table.Cell>
                    <Table.Cell>
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Edit agent"
                          aria-label={`Edit agent ${agent.number}`}
                          onClick={() => openEdit(agent)}
                        >
                          <IconEdit />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Delete agent"
                          aria-label={`Delete agent ${agent.number}`}
                          onClick={() => askRemove(agent)}
                        >
                          <IconTrash />
                        </Button>
                      </div>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {totalCount} {totalCount === 1 ? 'agent' : 'agents'}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1 || loading}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </Button>
              <span>
                Page {page} of {pageCount}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= pageCount || loading}
                onClick={() => setPage(page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}

      <AgentSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        agent={editing}
      />
    </div>
  );
};
