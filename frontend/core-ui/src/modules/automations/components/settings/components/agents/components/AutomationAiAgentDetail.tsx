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
import { IconChevronDownLeft, IconChevronLeft } from '@tabler/icons-react';
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
  const handleSubmit = form.handleSubmit(handleSave, () => {
    toast({
      title: 'Invalid form',
      description: 'Please review the highlighted fields.',
      variant: 'destructive',
    });
  });

  return (
    <div className="flex h-full min-h-0 w-full flex-col">
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

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-4 pb-4">
        <FormProvider {...form}>
          <div className="sticky top-0 z-10 -mx-4 border-b bg-background/95 px-4 py-4 backdrop-blur-sm">
            <div className="flex justify-between gap-2">
              <Link to="/settings/automations/agents">
                <Button variant="secondary">
                  <IconChevronLeft /> Back
                </Button>
              </Link>
              <Button onClick={handleSubmit}>Save</Button>
            </div>
          </div>

          <Tabs defaultValue="general" className="flex min-h-0 flex-1 flex-col">
            <Tabs.List className="mt-4 shrink-0">
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

            <div className="min-h-0 flex-1 overflow-y-auto pt-4">
              <Tabs.Content value="general" className="mt-0">
                <Card className="p-4">
                  <AiAgentGeneralForm />
                </Card>
              </Tabs.Content>

              <Tabs.Content
                value="connection"
                className="mt-0 grid gap-4 lg:grid-cols-2"
              >
                <Card className="p-4">
                  <AiAgentConnectionForm
                    existingApiKeyMask={detail?.connection?.config?.apiKey}
                  />
                </Card>
                <Card className="p-4">
                  <AiAgentRuntimeForm />
                </Card>
              </Tabs.Content>

              <Tabs.Content value="context" className="mt-0">
                <AiAgentContextForm />
              </Tabs.Content>

              <Tabs.Content value="health" className="mt-0">
                <AutomationAiAgentHealthSection agentId={detail?._id} />
              </Tabs.Content>
            </div>
          </Tabs>
        </FormProvider>
      </div>
    </div>
  );
};
