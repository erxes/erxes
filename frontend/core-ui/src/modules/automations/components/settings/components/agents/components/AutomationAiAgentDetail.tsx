import { AiAgentConnectionForm } from '@/automations/components/settings/components/agents/components/form/AiAgentConnectionForm';
import { AiAgentContextForm } from '@/automations/components/settings/components/agents/components/form/AiAgentContextForm';
import { AiAgentGeneralForm } from '@/automations/components/settings/components/agents/components/form/AiAgentGeneralForm';
import { AiAgentRuntimeForm } from '@/automations/components/settings/components/agents/components/form/AiAgentRuntimeForm';
import { AutomationAiAgentHealthSection } from '@/automations/components/settings/components/agents/components/form/AutomationAiAgentHealthSection';
import { getAiAgentKind } from '@/automations/components/settings/components/agents/constants/automationAiAgents';
import { AiAgentInput } from '@/automations/components/settings/components/agents/hooks/useAiAgentDetail';
import {
  buildAiAgentFormSchema,
  normalizeAiAgentFormValues,
  TAiAgentForm,
} from '@/automations/components/settings/components/agents/states/AiAgentFormSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Card, Tabs, toast } from 'erxes-ui';
import { FormProvider, useForm } from 'react-hook-form';
import { Link } from 'react-router';

export const AutomationAiAgentDetail = ({
  detail,
  handleSave,
}: {
  detail: any;
  handleSave: (input: AiAgentInput) => Promise<any>;
}) => {
  const form = useForm<TAiAgentForm>({
    resolver: zodResolver(
      buildAiAgentFormSchema({ requireApiKey: !detail?._id }),
    ),
    values: normalizeAiAgentFormValues(detail),
  });

  const provider = form.watch('connection.provider');
  const model = form.watch('connection.model');
  const kind = getAiAgentKind(provider);
  const Icon = kind.icon;

  return (
    <div className="flex h-full w-full flex-col">
      <div className="border-b bg-sidebar px-4 py-3">
        <Card className="w-full max-w-sm rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg border bg-background">
              <Icon className="size-5 text-primary" />
            </div>
            <div className="space-y-1">
              <h6 className="text-sm font-semibold">{kind.label}</h6>
              <p className="text-xs text-muted-foreground">
                {model || 'Model not configured yet'}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="flex flex-1 flex-col px-4 pb-4">
        <FormProvider {...form}>
          <Tabs defaultValue="general" className="flex flex-1 flex-col">
            <Tabs.List>
              <Tabs.Trigger className="w-1/4" value="general">
                General
              </Tabs.Trigger>
              <Tabs.Trigger className="w-1/4" value="connection">
                Connection
              </Tabs.Trigger>
              <Tabs.Trigger className="w-1/4" value="context">
                Context
              </Tabs.Trigger>
              <Tabs.Trigger className="w-1/4" value="health">
                Health
              </Tabs.Trigger>
            </Tabs.List>

            <Tabs.Content value="general" className="pt-4">
              <Card className="p-4">
                <AiAgentGeneralForm />
              </Card>
            </Tabs.Content>

            <Tabs.Content
              value="connection"
              className="grid gap-4 pt-4 lg:grid-cols-2"
            >
              <Card className="p-4">
                <AiAgentConnectionForm />
              </Card>
              <Card className="p-4">
                <AiAgentRuntimeForm />
              </Card>
            </Tabs.Content>

            <Tabs.Content value="context" className="pt-4">
              <AiAgentContextForm />
            </Tabs.Content>

            <Tabs.Content value="health" className="pt-4">
              <AutomationAiAgentHealthSection agentId={detail?._id} />
            </Tabs.Content>
          </Tabs>

          <div className="flex justify-end gap-2 pt-4">
            <Link to="/settings/automations/agents">
              <Button variant="secondary">Back</Button>
            </Link>
            <Button
              onClick={form.handleSubmit(handleSave, () => {
                toast({
                  title: 'Invalid form',
                  description: 'Please review the highlighted fields.',
                  variant: 'destructive',
                });
              })}
            >
              Save
            </Button>
          </div>
        </FormProvider>
      </div>
    </div>
  );
};
