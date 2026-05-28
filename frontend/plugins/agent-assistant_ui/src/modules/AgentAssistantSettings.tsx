import { lazy, Suspense, useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { Button, Spinner } from 'erxes-ui';
import { IconPlus } from '@tabler/icons-react';
import { AgentAssistantForm } from '@/agent-assistant/components/AgentAssistantForm';
import { AgentAssistantList } from '@/agent-assistant/components/AgentAssistantList';
import { AGENT_ASSISTANTS_QUERY } from '@/agent-assistant/graphql/queries';
import {
  AGENT_ASSISTANTS_ADD_MUTATION,
  AGENT_ASSISTANTS_EDIT_MUTATION,
} from '@/agent-assistant/graphql/mutations';

const AgentAssistantSettings = () => {
  const [formOpen, setFormOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<any>(null);

  const { data, loading } = useQuery(AGENT_ASSISTANTS_QUERY, {
    variables: { page: 1, perPage: 20 },
  });

  const [addAgent] = useMutation(AGENT_ASSISTANTS_ADD_MUTATION, {
    refetchQueries: [{ query: AGENT_ASSISTANTS_QUERY }],
  });

  const [editAgent] = useMutation(AGENT_ASSISTANTS_EDIT_MUTATION, {
    refetchQueries: [{ query: AGENT_ASSISTANTS_QUERY }],
  });

  const handleSubmit = (doc: any) => {
    if (editingAgent) {
      editAgent({ variables: { _id: editingAgent._id, doc } });
    } else {
      addAgent({ variables: { doc } });
    }
    setEditingAgent(null);
  };

  const handleEdit = (agent: any) => {
    setEditingAgent(agent);
    setFormOpen(true);
  };

  const agents = data?.agentAssistants || [];

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold">Agent Assistants</h1>
        <Button onClick={() => { setEditingAgent(null); setFormOpen(true); }}>
          <IconPlus size={16} /> Add Agent
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center">
          <Spinner />
        </div>
      ) : (
        <AgentAssistantList agents={agents} onEdit={handleEdit} />
      )}

      <AgentAssistantForm
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditingAgent(null);
        }}
        onSubmit={handleSubmit}
        initialData={editingAgent}
      />
    </div>
  );
};

export default AgentAssistantSettings;
