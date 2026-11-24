import type { AgentSettings, coreContract } from '@erxes/core-contract';
import { messageOf, orpc } from '@erxes/core-contract/client';
import type { InferContractRouterOutputs } from '@orpc/contract';
import { IconRobot, IconTrash } from '@tabler/icons-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AppBreadcrumb,
  Alert,
  Button,
  PageContainer,
  PageHeader,
  ScrollArea,
  Spinner,
  Tabs,
  useToast,
} from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { QueryState } from '~/components/QueryState';
import { paths } from '~/lib/paths';
import { PROVIDER_LABELS } from '~/modules/assistant/providers';
import { useKeyPlugins } from '../developer/keys/useKeyPlugins';
import { AgentAccess } from './AgentAccess';
import { AgentFields } from './AgentFields';
import { AgentRuns } from './AgentRuns';
import { TEMPLATES } from './agentTemplates';
import { TryAgent } from './TryAgent';

type SavedAgent = InferContractRouterOutputs<typeof coreContract>['agents']['get'];

const useRefresh = (id: string) => {
  const client = useQueryClient();

  return () =>
    Promise.all([
      client.invalidateQueries({ queryKey: orpc.agents.list.key() }),
      client.invalidateQueries({ queryKey: orpc.agents.get.key({ input: { id } }) }),
    ]);
};

/** The model that answers now, the organisation's default when the agent names none. */
const RunsOn = ({ agent }: { agent: SavedAgent }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'agents' });
  const { runsOn } = agent;

  if (!runsOn) {
    return (
      <p className="text-sm text-destructive-text">
        {t('runs-on-none', 'No AI provider is connected: connect one in Settings › Integrations.')}
      </p>
    );
  }

  const model = `${PROVIDER_LABELS[runsOn.provider]} · ${runsOn.model}`;

  return (
    <p className="text-sm text-muted-foreground">
      {agent.provider
        ? t('runs-on', 'Answers with {{model}}.', { model })
        : t('runs-on-default', "Answers with {{model}}, the organisation's default.", { model })}
    </p>
  );
};

/** A shop, hotel or tour agent without a portal can only talk: it can't sell. */
const NoPortal = ({ agent }: { agent: SavedAgent }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'agents' });
  const sells = TEMPLATES.some(({ id, customers }) => customers && id === agent.template);

  if (!sells || agent.portalId) return null;

  return (
    <Alert variant="destructive">
      <Alert.Title>
        {t('no-portal', "No portal: it can't take orders or bookings or see a customer's own")}
      </Alert.Title>
      <Alert.Description>
        {t('no-portal-text', 'Pick the portal of its shop, hotel or tours under Customers.')}
      </Alert.Description>
    </Alert>
  );
};

const Setup = ({ agent }: { agent: SavedAgent }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'agents' });
  const { toast } = useToast();
  const navigate = useNavigate();
  const refresh = useRefresh(agent.id);
  const [draft, setDraft] = useState<AgentSettings>(() => ({ ...agent }));

  const failed = (failure: Error) =>
    toast({
      variant: 'destructive',
      title: t('failed', 'Not saved'),
      description: messageOf(failure),
    });

  const update = useMutation(
    orpc.agents.update.mutationOptions({
      onSuccess: () => {
        void refresh();
        toast({ title: t('saved', 'Saved') });
      },
      onError: failed,
    }),
  );

  const remove = useMutation(
    orpc.agents.remove.mutationOptions({
      onSuccess: () => {
        void refresh();
        void navigate(paths.settings.agents);
      },
      onError: failed,
    }),
  );

  const { name, instructions, provider, model, portalId } = draft;

  return (
    <div className="space-y-4">
      <NoPortal agent={agent} />
      <RunsOn agent={agent} />
      <AgentFields draft={draft} onChange={setDraft} />
      <div className="flex justify-between gap-2">
        <Button
          variant="ghost"
          tone="destructive"
          disabled={remove.isPending}
          onClick={() => remove.mutate({ id: agent.id })}
        >
          <IconTrash />
          {t('remove', 'Delete agent')}
        </Button>
        <Button
          disabled={update.isPending || !name.trim() || !instructions.trim()}
          onClick={() =>
            update.mutate({ id: agent.id, name, instructions, provider, model, portalId })
          }
        >
          {update.isPending && <Spinner size="sm" />}
          {t('save', 'Save')}
        </Button>
      </div>
    </div>
  );
};

/** Settings › Agents › one agent: its words and model, what it may read, and a test chat. */
export const AgentPage = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'agents' });
  const { id = '' } = useParams();
  const agent = useQuery(orpc.agents.get.queryOptions({ input: { id } }));
  const refresh = useRefresh(id);
  const { loading } = useKeyPlugins();

  return (
    <PageContainer>
      <PageHeader>
        <PageHeader.Start>
          <AppBreadcrumb
            items={[
              { label: t('title', 'Agents'), to: paths.settings.agents, icon: IconRobot },
              { label: agent.data?.name ?? '…', to: paths.settings.agentOf(id) },
            ]}
          />
        </PageHeader.Start>
      </PageHeader>
      <ScrollArea className="flex-1">
        <div className="mx-auto max-w-4xl p-6">
          {loading ? (
            <Spinner className="mx-auto my-12" />
          ) : (
            <QueryState query={agent} className="py-12">
              {(saved) => (
                <Tabs defaultValue="setup">
                  <Tabs.List variant="underline" className="mb-4">
                    <Tabs.Trigger value="setup">{t('tab-setup', 'Setup')}</Tabs.Trigger>
                    <Tabs.Trigger value="access">{t('tab-access', 'Access')}</Tabs.Trigger>
                    <Tabs.Trigger value="try">{t('tab-try', 'Try it')}</Tabs.Trigger>
                  </Tabs.List>
                  <Tabs.Content value="setup">
                    <Setup key={saved.updatedAt} agent={saved} />
                  </Tabs.Content>
                  <Tabs.Content value="access">
                    <AgentAccess
                      key={String(saved.key.updatedAt)}
                      agent={saved}
                      apiKey={saved.key}
                      onSaved={() => void refresh()}
                    />
                  </Tabs.Content>
                  <Tabs.Content value="try">
                    <div className="flex flex-col gap-8">
                      <TryAgent agentId={saved.id} />
                      <AgentRuns agentId={saved.id} />
                    </div>
                  </Tabs.Content>
                </Tabs>
              )}
            </QueryState>
          )}
        </div>
      </ScrollArea>
    </PageContainer>
  );
};
