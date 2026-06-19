import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { IconRobot, IconArrowLeft } from '@tabler/icons-react';
import { Breadcrumb, Button, Form, Separator } from 'erxes-ui';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PageHeader } from 'ui-modules';
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

export const AgentFormPage = () => {
  const { id } = useParams();
  const isEdit = !!id;

  const form = useForm<AgentFormValues>({
    resolver: zodResolver(agentFormSchema),
    defaultValues: AGENT_FORM_DEFAULTS,
  });

  const [autoSlug, setAutoSlug] = useState(true);

  const { agent } = useAgent(id);
  const { saveAgent, saving } = useSaveAgent(id);
  const { canCreate, canEdit } = useAgentAccess();
  const canSave = isEdit ? canEdit : canCreate;

  // Populate form from saved data — runs once when agent data arrives
  useEffect(() => {
    if (isEdit && agent) {
      form.reset({
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
      });
      setAutoSlug(false);
    }
  }, [agent, isEdit, form]);

  const handleNameChange = (value: string) => {
    form.setValue('name', value, { shouldValidate: true });
    if (autoSlug) form.setValue('agentId', toSlug(value));
  };

  const onSubmit = (doc: AgentFormValues) => saveAgent(doc);

  const model = form.watch('model');

  const saveLabel = isEdit ? 'Save Changes' : 'Create Agent';

  return (
    <div className="flex flex-col h-full">
      <PageHeader>
        <PageHeader.Start>
          <Breadcrumb>
            <Breadcrumb.List className="gap-1">
              <Breadcrumb.Item>
                <Button variant="ghost" asChild>
                  <Link to="/settings/erxes-agent/agents">
                    <IconRobot />
                    Agents
                  </Link>
                </Button>
              </Breadcrumb.Item>
              <Breadcrumb.Separator />
              <Breadcrumb.Item>
                <span className="text-muted-foreground">
                  {isEdit ? 'Edit Agent' : 'New Agent'}
                </span>
              </Breadcrumb.Item>
            </Breadcrumb.List>
          </Breadcrumb>
          <Separator.Inline />
        </PageHeader.Start>
        <PageHeader.End>
          <Button variant="outline" asChild>
            <Link to="/settings/erxes-agent/agents">
              <IconArrowLeft /> Back
            </Link>
          </Button>
          <Button
            type="submit"
            form="agent-form"
            disabled={saving || !model || !canSave}
          >
            {saving ? 'Saving…' : saveLabel}
          </Button>
        </PageHeader.End>
      </PageHeader>

      <div className="flex-1 overflow-auto p-4">
        <Form {...form}>
          <form
            id="agent-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="max-w-2xl mx-auto space-y-4"
          >
            <AgentFormFields
              form={form}
              agentIdEditable
              onNameChange={handleNameChange}
              onAgentIdChange={() => setAutoSlug(false)}
            />

            <div className="flex gap-3 pb-4 sm:hidden">
              <Button type="submit" disabled={saving || !canSave}>
                {saving ? 'Saving…' : saveLabel}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link to="/settings/erxes-agent/agents">Cancel</Link>
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};
