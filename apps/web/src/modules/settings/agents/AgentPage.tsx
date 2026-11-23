import type { Agent, AgentSettings, ApiKey } from '@erxes/core-contract';
import { messageOf, orpc } from '@erxes/core-contract/client';
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
import { useSession } from '~/modules/auth/session';
import { AccessSection } from '../developer/keys/KeyAccess';
import { draftOf, fitLimits, keyRules } from '../developer/keys/keyDraft';
import { TryKey } from '../developer/keys/TryKey';
import { useGiver, useKeyPlugins } from '../developer/keys/useKeyPlugins';
import { AgentFields } from './AgentFields';
import { TryAgent } from './TryAgent';

const useRefresh = (id: string) => {
  const client = useQueryClient();

  return () =>
    Promise.all([
      client.invalidateQueries({ queryKey: orpc.agents.list.key() }),
      client.invalidateQueries({ queryKey: orpc.agents.get.key({ input: { id } }) }),
    ]);
};

const useFailed = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'agents' });
  const { toast } = useToast();

  return (failure: Error) =>
    toast({
      variant: 'destructive',
      title: t('failed', 'Not saved'),
      description: messageOf(failure),
    });
};

const Setup = ({ agent }: { agent: Agent }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'agents' });
  const { toast } = useToast();
  const navigate = useNavigate();
  const refresh = useRefresh(agent.id);
  const failed = useFailed();
  const [draft, setDraft] = useState<AgentSettings>(() => ({ ...agent }));

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

  const { name, instructions, provider, model, websiteId } = draft;

  return (
    <div className="space-y-4">
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
            update.mutate({ id: agent.id, name, instructions, provider, model, websiteId })
          }
        >
          {update.isPending && <Spinner size="sm" />}
          {t('save', 'Save')}
        </Button>
      </div>
    </div>
  );
};

/** What the agent may read and do: its key's rules, which only the key's maker changes. */
const Access = ({ agentId, apiKey }: { agentId: string; apiKey: ApiKey }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'agents' });
  const { toast } = useToast();
  const { user } = useSession();
  const giver = useGiver();
  const refresh = useRefresh(agentId);
  const failed = useFailed();
  const [draft, setDraft] = useState(() => draftOf(apiKey, giver));
  const mine = apiKey.userId === user.id;

  const update = useMutation(
    orpc.apiKeys.update.mutationOptions({
      onSuccess: () => {
        void refresh();
        toast({ title: t('saved', 'Saved') });
      },
      onError: failed,
    }),
  );

  return (
    <div className="space-y-4">
      {!mine && (
        <Alert>
          <Alert.Title>
            {t('access-theirs', 'Only {{name}} can change this', {
              name: apiKey.memberName ?? apiKey.memberEmail,
            })}
          </Alert.Title>
          <Alert.Description>
            {t(
              'access-theirs-text',
              'The agent acts by the access of the member who made it, never beyond it.',
            )}
          </Alert.Description>
        </Alert>
      )}
      <AccessSection draft={draft} onChange={(next) => setDraft(fitLimits(next))} />
      {mine && (
        <div className="flex justify-end">
          <Button
            disabled={update.isPending}
            onClick={() => update.mutate({ id: apiKey.id, ...keyRules(draft) })}
          >
            {update.isPending && <Spinner size="sm" />}
            {t('save', 'Save')}
          </Button>
        </div>
      )}
      <TryKey apiKey={apiKey} />
    </div>
  );
};

/** Settings › Agents › one agent: its words and model, what it may read, and a test chat. */
export const AgentPage = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'agents' });
  const { id = '' } = useParams();
  const agent = useQuery(orpc.agents.get.queryOptions({ input: { id } }));
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
              {({ key, ...saved }) => (
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
                    <Access key={String(key.updatedAt)} agentId={saved.id} apiKey={key} />
                  </Tabs.Content>
                  <Tabs.Content value="try">
                    <TryAgent agentId={saved.id} />
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
