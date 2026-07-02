import { AiAgentConnectionForm } from '@/automations/components/settings/components/agents/components/form/connection/AiAgentConnectionForm';
import { AiAgentContextForm } from '@/automations/components/settings/components/agents/components/form/AiAgentContextForm';
import { AiAgentGeneralForm } from '@/automations/components/settings/components/agents/components/form/AiAgentGeneralForm';
import { AiAgentRuntimeForm } from '@/automations/components/settings/components/agents/components/form/AiAgentRuntimeForm';
import { AutomationAiAgentHealthSection } from '@/automations/components/settings/components/agents/components/form/AutomationAiAgentHealthSection';
import { AiAgentInput } from '@/automations/components/settings/components/agents/hooks/useAiAgentDetail';
import { AutomationSettingsDetailHeader } from '@/automations/components/settings/components/AutomationSettingsDetailHeader';
import {
  AI_AGENT_PROVIDER_TYPES,
  TAiAgentProvider,
} from '@/automations/components/settings/components/agents/constants/providers';
import {
  buildAiAgentFormSchema,
  normalizeAiAgentFormValues,
  TAiAgentFormDetail,
  TAiAgentForm,
} from '@/automations/components/settings/components/agents/states/AiAgentFormSchema';
import { AUTOMATION_APPROVAL_CONTENT_TYPES } from '@/automations/constants';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  IconActivityHeartbeat,
  IconBook2,
  IconDeviceFloppy,
  IconPlug,
  IconSettings,
} from '@tabler/icons-react';
import { Button, Card, Tabs, toast } from 'erxes-ui';
import { FormProvider, useForm } from 'react-hook-form';
import { useSearchParams } from 'react-router';
import { ApprovalLockButton } from 'ui-modules';
import { useTranslation } from 'react-i18next';

export const AutomationAiAgentDetail = ({
  detail,
  handleSave,
}: {
  detail?: TAiAgentFormDetail;
  handleSave: (input: AiAgentInput) => Promise<unknown>;
}) => {
  const { t } = useTranslation('automations');
  const isEditing = !!detail;
  const [searchParams, setSearchParams] = useSearchParams();
  const queryKind = searchParams.get('kind');
  const AI_AGENT_TABS = ['general', 'connection', 'context', 'health'];
  const tabParam = searchParams.get('tab');
  const activeTab = AI_AGENT_TABS.includes(tabParam ?? '')
    ? (tabParam as string)
    : 'general';

  const handleTabChange = (value: string) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set('tab', value);
        return next;
      },
      { replace: true },
    );
  };
  const defaultProvider =
    !isEditing &&
    AI_AGENT_PROVIDER_TYPES.includes(queryKind as TAiAgentProvider)
      ? (queryKind as TAiAgentProvider)
      : undefined;

  const form = useForm<TAiAgentForm>({
    resolver: zodResolver(
      buildAiAgentFormSchema({ requireApiKey: !detail?._id }),
    ),
    values: normalizeAiAgentFormValues(detail, defaultProvider),
  });

  const handleSubmit = form.handleSubmit(handleSave, (error) => {
    console.error(error);
    toast({
      title: t('invalid-form', 'Invalid form'),
      description: t('review-highlighted-fields', 'Please review the highlighted fields.'),
      variant: 'destructive',
    });
  });

  return (
    <div className="flex h-full min-h-0 w-full flex-col">
      <FormProvider {...form}>
        <AutomationSettingsDetailHeader
          title={isEditing ? t('edit-ai-agent', 'Edit AI Agent') : t('create-ai-agent', 'Create AI Agent')}
          description={
            isEditing
              ? t('update-your-ai-agent', 'Update your AI agent')
              : t('create-new-ai-agent', 'Create a new AI agent for automation')
          }
          backTo="/settings/automations/agents"
          actions={
            <div className="flex items-center gap-2">
              {detail?._id && (
                <ApprovalLockButton
                  contentType={
                    AUTOMATION_APPROVAL_CONTENT_TYPES.AUTOMATION_AI_AGENT
                  }
                  contentId={detail._id}
                  action="edit"
                />
              )}
              <Button onClick={handleSubmit}>
                <IconDeviceFloppy className="size-4 " />
                {t('save', 'Save')}
              </Button>
            </div>
          }
        />

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-6 pb-4">
          <Tabs
            value={activeTab}
            onValueChange={handleTabChange}
            className="flex min-h-0 flex-1 flex-col"
          >
            <Tabs.List className="mt-4 shrink-0">
              <Tabs.Trigger className="w-1/4 gap-2" value="general">
                <IconSettings className="size-4" />
                {t('general', 'General')}
              </Tabs.Trigger>
              <Tabs.Trigger className="w-1/4 gap-2" value="connection">
                <IconPlug className="size-4" />
                {t('connection', 'Connection')}
              </Tabs.Trigger>
              <Tabs.Trigger className="w-1/4 gap-2" value="context">
                <IconBook2 className="size-4" />
                {t('context', 'Context')}
              </Tabs.Trigger>
              <Tabs.Trigger className="w-1/4 gap-2" value="health">
                <IconActivityHeartbeat className="size-4" />
                {t('health', 'Health')}
              </Tabs.Trigger>
            </Tabs.List>

            <div className="min-h-0 flex-1 overflow-y-auto pt-4">
              <Tabs.Content value="general" className="mt-0 px-2">
                <Card className="p-4">
                  <AiAgentGeneralForm />
                </Card>
              </Tabs.Content>

              <Tabs.Content
                value="connection"
                className="mt-0 grid gap-4 lg:grid-cols-2 px-2"
              >
                <Card className="p-4">
                  <AiAgentConnectionForm
                    existingApiKeyMask={detail?.connection?.config?.apiKey}
                    existingGatewayTokenMask={
                      detail?.connection?.provider === 'cloudflare-ai-gateway'
                        ? String(
                            detail?.connection?.config?.gatewayToken || '',
                          ) || undefined
                        : undefined
                    }
                  />
                </Card>
                <Card className="p-4">
                  <AiAgentRuntimeForm />
                </Card>
              </Tabs.Content>

              <Tabs.Content value="context" className="mt-0 px-2">
                <AiAgentContextForm />
              </Tabs.Content>

              <Tabs.Content value="health" className="mt-0 px-2">
                <AutomationAiAgentHealthSection agentId={detail?._id} />
              </Tabs.Content>
            </div>
          </Tabs>
        </div>
      </FormProvider>
    </div>
  );
};
