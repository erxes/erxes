import { useMutation } from '@apollo/client';
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from 'erxes-ui';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import {
  AGENT_ASSISTANTS_REMOVE_MUTATION,
} from '@/agent-assistant/graphql/mutations';
import { AGENT_ASSISTANTS_QUERY } from '@/agent-assistant/graphql/queries';

interface Agent {
  _id: string;
  name: string;
  description?: string;
  modelProvider: string;
  status: string;
  createdAt: string;
}

interface AgentAssistantListProps {
  agents: Agent[];
  onEdit: (agent: Agent) => void;
}

export const AgentAssistantList = ({ agents, onEdit }: AgentAssistantListProps) => {
  const [removeAgent] = useMutation(AGENT_ASSISTANTS_REMOVE_MUTATION, {
    refetchQueries: [{ query: AGENT_ASSISTANTS_QUERY }],
  });

  const handleDelete = (_id: string) => {
    if (window.confirm('Are you sure you want to delete this agent?')) {
      removeAgent({ variables: { _id } });
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Provider</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {agents.map((agent) => (
          <TableRow key={agent._id}>
            <TableCell>{agent.name}</TableCell>
            <TableCell>{agent.modelProvider}</TableCell>
            <TableCell>{agent.status}</TableCell>
            <TableCell>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(agent)}
                >
                  <IconEdit size={16} />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(agent._id)}
                >
                  <IconTrash size={16} />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
