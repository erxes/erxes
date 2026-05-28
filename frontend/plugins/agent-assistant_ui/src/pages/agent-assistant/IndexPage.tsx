import {
  IconCaretDownFilled,
  IconSandbox,
  IconSettings,
} from '@tabler/icons-react';
import { Breadcrumb, Button, Separator } from 'erxes-ui';
import { PageHeader } from 'ui-modules';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { AgentAssistantForm } from '@/agent-assistant/components/AgentAssistantForm';
import { AgentAssistantList } from '@/agent-assistant/components/AgentAssistantList';
import { useQuery, useMutation } from '@apollo/client';
import { AGENT_ASSISTANTS_QUERY } from '@/agent-assistant/graphql/queries';
import {
  AGENT_ASSISTANTS_ADD_MUTATION,
  AGENT_ASSISTANTS_EDIT_MUTATION,
} from '@/agent-assistant/graphql/mutations';

export const IndexPage = () => {
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
    <div className="flex flex-col h-full">
      <PageHeader>
        <PageHeader.Start>
          <Breadcrumb>
            <Breadcrumb.List className="gap-1">
              <Breadcrumb.Item>
                <Button variant="ghost" asChild>
                  <Link to="/settings/agent-assistant">
                    <IconSandbox />
                    agent-assistant
                  </Link>
                </Button>
              </Breadcrumb.Item>
            </Breadcrumb.List>
          </Breadcrumb>
          <Separator.Inline />
          <PageHeader.FavoriteToggleButton />
        </PageHeader.Start>
        <PageHeader.End>
          <Button variant="outline" asChild>
            <Link to="/settings/agent-assistant">
              <IconSettings />
              Go to settings
            </Link>
          </Button>
          <Button onClick={() => { setEditingAgent(null); setFormOpen(true); }}>
            Add Agent
          </Button>
          <Button>
            More <IconCaretDownFilled />
          </Button>
        </PageHeader.End>
      </PageHeader>
      <div className="flex h-full overflow-hidden">
        <div className="flex flex-col h-full overflow-hidden flex-auto p-4">
          {loading ? (
            <div>Loading...</div>
          ) : (
            <AgentAssistantList agents={agents} onEdit={handleEdit} />
          )}
        </div>
      </div>

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
