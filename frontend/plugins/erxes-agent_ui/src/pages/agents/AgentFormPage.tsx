import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { IconRobot } from '@tabler/icons-react';
import { ResourceFormLayout } from '~/components/ResourceFormLayout';
import { useResourceForm } from '~/components/useResourceForm';
import { AgentFormFields } from './components/AgentFormFields';
import { useAgent } from './hooks/useAgent';
import { useAgentAccess } from './hooks/useAgentAccess';
import { useSaveAgent } from './hooks/useSaveAgent';
import {
  AGENT_FORM_DEFAULTS,
  AgentFormValues,
  agentFormSchema,
} from './validations';
import { toSlug } from './utils';
import { IMastraAgent } from './types';

export const AgentFormPage = () => {
  const { id } = useParams();
  const isEdit = !!id;

  const [autoSlug, setAutoSlug] = useState(true);

  const { agent } = useAgent(id);
  const { saveAgent, saving } = useSaveAgent(id);
  const { canCreate, canEdit } = useAgentAccess();
  const canSave = isEdit ? canEdit : canCreate;

  const form = useResourceForm<AgentFormValues, IMastraAgent>({
    schema: agentFormSchema,
    defaults: AGENT_FORM_DEFAULTS,
    isEdit,
    record: agent,
    load: (agent) => ({
      name: agent.name || '',
      agentId: agent.agentId || '',
      description: agent.description || '',
      instructions: agent.instructions || '',
      provider: agent.provider || '',
      model: agent.model || '',
      toolPolicy: agent.toolPolicy === 'custom' ? 'custom' : 'all',
      allowedTools: agent.allowedTools || [],
      destructiveOps: agent.destructiveOps === 'allow' ? 'allow' : 'ask',
      memoryEnabled: agent.memoryEnabled ?? true,
      maxSteps: agent.maxSteps ?? 10,
      temperature: agent.temperature ?? null,
      isEnabled: agent.isEnabled ?? true,
    }),
    onLoaded: () => setAutoSlug(false),
  });

  const handleNameChange = (value: string) => {
    form.setValue('name', value, { shouldValidate: true });
    if (autoSlug) form.setValue('agentId', toSlug(value));
  };

  const onSubmit = (doc: AgentFormValues) => saveAgent(doc);

  const model = form.watch('model');

  return (
    <ResourceFormLayout
      icon={IconRobot}
      title="Agents"
      noun="Agent"
      rootPath="/settings/erxes-agent/agents"
      isEdit={isEdit}
      saving={saving}
      saveLabel={isEdit ? 'Save Changes' : 'Create Agent'}
      formId="agent-form"
      submitDisabled={!model || !canSave}
      form={form}
      onSubmit={onSubmit}
      mobileFooter
    >
      <AgentFormFields
        form={form}
        agentIdEditable
        onNameChange={handleNameChange}
        onAgentIdChange={() => setAutoSlug(false)}
      />
    </ResourceFormLayout>
  );
};
