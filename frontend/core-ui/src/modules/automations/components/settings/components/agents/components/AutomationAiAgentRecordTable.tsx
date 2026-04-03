import { AUTOMATIONS_AI_AGENTS } from '@/automations/components/settings/components/agents/graphql/automationsAiAgents';
import { AutomationAiAgentTableEmptyState } from '@/automations/components/settings/components/agents/components/AutomationAiAgentTableEmptyState';
import { useQuery } from '@apollo/client';
import { IconEdit, IconPlus, IconTrash } from '@tabler/icons-react';
import {
  Button,
  cn,
  RelativeDateDisplay,
  Skeleton,
  Table,
  useQueryState,
} from 'erxes-ui';
import { Link } from 'react-router';

type AiAgents = {
  automationsAiAgents: {
    _id: string;
    name: string;
    description: string;
    createdAt: string;
  }[];
};

export const AutomationAiAgentRecordTable = () => {
  const [kind] = useQueryState<string>('kind');

  const { data, loading } = useQuery<AiAgents>(AUTOMATIONS_AI_AGENTS, {
    variables: { kind },
    skip: !kind,
  });

  const { automationsAiAgents = [] } = data || {};

  // Show empty state when not loading and no agents
  if (!loading && automationsAiAgents.length === 0) {
    return <AutomationAiAgentTableEmptyState />;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button asChild>
          <Link to="/settings/automations/agents/create">
            <IconPlus className="size-4" />
            Create Agent
          </Link>
        </Button>
      </div>
      <Table>
        <Table.Row>
          <Table.Head>Name</Table.Head>
          <Table.Head>Description</Table.Head>
          <Table.Head>Created at</Table.Head>
          <Table.Head className="w-28 text-center">Action</Table.Head>
        </Table.Row>
        <Table.Body>
          {loading &&
            Array.from({ length: 10 }).map((_, index) => (
              <Table.Row key={index} className={cn('h-cell')}>
                {Array.from({ length: 3 }).map((_, index) => (
                  <Table.Cell key={index} className={cn('border-r-0 px-2')}>
                    <Skeleton className="h-4 w-full min-w-4" />
                  </Table.Cell>
                ))}
              </Table.Row>
            ))}

          {automationsAiAgents.map(({ _id, name, description, createdAt }) => (
            <Table.Row key={_id}>
              <Table.Cell>{name}</Table.Cell>
              <Table.Cell className="truncate">{description}</Table.Cell>
              <Table.Cell>
                <RelativeDateDisplay.Value value={createdAt} />
              </Table.Cell>
              <Table.Cell className="flex justify-center items-center">
                <Link to={`/settings/automations/agents/${_id}`}>
                  <Button variant="ghost">
                    <IconEdit />
                  </Button>
                </Link>
                <Button variant="ghost" className="text-destructive">
                  <IconTrash />
                </Button>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </div>
  );
};
