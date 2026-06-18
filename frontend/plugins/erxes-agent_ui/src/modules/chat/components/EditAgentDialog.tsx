import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button, Dialog, Form, Tooltip } from 'erxes-ui';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AgentFormFields } from '~/pages/agents/components/AgentFormFields';
import {
  AGENT_FORM_DEFAULTS,
  AgentFormValues,
  agentFormSchema,
} from '~/pages/agents/validations';
import { IChatAgent } from '~/modules/chat/hooks/useChatAgents';
import { useUpdateAgent } from '~/modules/chat/hooks/useUpdateAgent';

/**
 * In-chat agent editor. Renders the canonical agent form (AgentFormFields) in a
 * modal so the agent powering the current conversation can be retuned — model,
 * provider, instructions, tools, behaviour — without leaving for the Agents
 * settings page. Unlike that page it stays put on save (useUpdateAgent) and
 * keeps agentId read-only, since changing it would orphan this conversation.
 */
export const EditAgentDialog = ({
  agent,
  open,
  onOpenChange,
}: {
  agent: IChatAgent;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const form = useForm<AgentFormValues>({
    resolver: zodResolver(agentFormSchema),
    defaultValues: AGENT_FORM_DEFAULTS,
  });

  const model = form.watch('model');
  const { saveAgent, saving } = useUpdateAgent(agent._id, () =>
    onOpenChange(false),
  );

  // Populate from the target agent when the dialog mounts. The dialog is only
  // mounted while open (lifted in AgentRail), so this runs once per open.
  useEffect(() => {
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
  }, [agent, form]);

  const onSubmit = (doc: AgentFormValues) => saveAgent(doc);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Dialog.Content className="max-w-2xl gap-0 p-0">
        <Dialog.Header className="border-b px-5 py-3.5">
          <Dialog.Title>Edit {agent.name}</Dialog.Title>
          <Dialog.Description>
            Change this agent's model, provider and behaviour. Changes apply to
            new messages right away.
          </Dialog.Description>
        </Dialog.Header>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="max-h-[65vh] space-y-4 overflow-y-auto px-5 py-4">
              <AgentFormFields form={form} />
            </div>

            <Dialog.Footer className="flex items-center gap-2 border-t px-5 py-3.5">
              <Tooltip.Provider>
                <Tooltip>
                  <Tooltip.Trigger asChild>
                    <Button variant="ghost" size="sm" asChild>
                      <Link
                        to={`/settings/erxes-agent/agents/edit/${agent._id}`}
                      >
                        Open full editor
                      </Link>
                    </Button>
                  </Tooltip.Trigger>
                  <Tooltip.Content>
                    Edit every setting on the Agents page
                  </Tooltip.Content>
                </Tooltip>
              </Tooltip.Provider>
              <div className="flex-1" />
              <Dialog.Close asChild>
                <Button type="button" variant="outline" size="sm">
                  Cancel
                </Button>
              </Dialog.Close>
              <Button type="submit" size="sm" disabled={saving || !model}>
                {saving ? 'Saving…' : 'Save changes'}
              </Button>
            </Dialog.Footer>
          </form>
        </Form>
      </Dialog.Content>
    </Dialog>
  );
};
