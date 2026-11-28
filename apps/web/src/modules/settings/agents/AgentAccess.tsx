import { API_KEY_AREA_INFO, type Agent, type ApiKey } from '@erxes/core-contract';
import { messageOf, orpc } from '@erxes/core-contract/client';
import { IconRestore } from '@tabler/icons-react';
import { useMutation } from '@tanstack/react-query';
import { Alert, Button, Spinner, useConfirm, useToast } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSession } from '~/modules/auth/session';
import { AccessSection } from '../developer/keys/KeyAccess';
import { areasOf, draftOf, fitLimits, type KeyDraft, keyRules } from '../developer/keys/keyDraft';
import { TryKey } from '../developer/keys/TryKey';
import { type KeyPlugin, useGiver, useKeyPlugins } from '../developer/keys/useKeyPlugins';
import { TEMPLATES, templateAccess } from './agentTemplates';

/** What a draft lets anyone do who chats with the agent: core areas, and plugins' changes. */
const exposure = (draft: KeyDraft, plugins: KeyPlugin[]) => [
  ...areasOf(draft.kind).flatMap((area) => {
    const level = draft.areas[area];

    return level ? [`${API_KEY_AREA_INFO[area].label} (${level})`] : [];
  }),
  ...Object.entries(draft.plugins).flatMap(([name, level]) => {
    const plugin = plugins.find((candidate) => candidate.name === name);
    const title = plugin?.title ?? name;
    const ticked = draft.actions[name];

    if (level !== 'write') return [];

    if (!ticked?.length) return [`${title} (write)`];

    return ticked
      .filter((action) => !action.endsWith('.view'))
      .map((action) => {
        const label = plugin?.actions.find((known) => known.action === action)?.label;

        return `${title}: ${label ?? action}`;
      });
  }),
];

type Saved = Pick<Agent, 'id' | 'template' | 'portalId'> & { plugins: string[] };

/** Only the key's maker changes its rules. */
const TheirKey = ({ apiKey }: { apiKey: ApiKey }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'agents' });

  return (
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
  );
};

const useUpdateKey = (onSaved: () => void) => {
  const { t } = useTranslation('settings', { keyPrefix: 'agents' });
  const { toast } = useToast();

  return useMutation(
    orpc.apiKeys.update.mutationOptions({
      onSuccess: () => {
        onSaved();
        toast({ title: t('saved', 'Saved') });
      },
      onError: (failure) =>
        toast({
          variant: 'destructive',
          title: t('failed', 'Not saved'),
          description: messageOf(failure),
        }),
    }),
  );
};

/**
 * What the agent may read and do: its key's rules, which only the key's maker changes. An agent
 * that serves customers warns before its key opens core areas or plugin changes to them.
 */
export const AgentAccess = ({
  agent,
  apiKey,
  onSaved,
}: {
  agent: Saved;
  apiKey: ApiKey;
  onSaved: () => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'agents' });
  const { confirm } = useConfirm();
  const { user } = useSession();
  const giver = useGiver();
  const { plugins } = useKeyPlugins();
  const [draft, setDraft] = useState(() => draftOf(apiKey, giver));
  const mine = apiKey.userId === user.id;
  const template = TEMPLATES.find(({ id }) => id !== null && id === agent.template);
  const servesCustomers = agent.portalId !== null || agent.plugins.length > 0;
  const before = new Set(exposure(draftOf(apiKey, giver), plugins));

  const opened = servesCustomers
    ? exposure(draft, plugins).filter((item) => !before.has(item))
    : [];

  const update = useUpdateKey(onSaved);

  const opens = t('access-opens', 'Anyone who chats with this agent could then use: {{list}}.', {
    list: opened.join(', '),
  });

  const submit = () => update.mutate({ id: apiKey.id, ...keyRules(draft) });

  const save = () => {
    if (!opened.length) return submit();

    void confirm({
      message: t('access-confirm', 'Open this to customers?'),
      options: {
        description: opens,
        okLabel: t('access-confirm-ok', 'Save anyway'),
        variants: { ok: 'destructive' },
      },
    }).then(submit);
  };

  const reset = () => {
    if (!template) return;

    const plugin = plugins.find(({ name }) => name === template.plugin);

    setDraft(fitLimits({ ...draft, preset: 'custom', ...templateAccess(template, plugin) }));
  };

  return (
    <div className="space-y-4">
      {!mine && <TheirKey apiKey={apiKey} />}
      <AccessSection draft={draft} onChange={(next) => setDraft(fitLimits(next))} />
      {opened.length > 0 && (
        <Alert variant="destructive">
          <Alert.Title>{t('access-customers', 'This agent talks to customers')}</Alert.Title>
          <Alert.Description>{opens}</Alert.Description>
        </Alert>
      )}
      {mine && (
        <div className="flex justify-between gap-2">
          {template ? (
            <Button variant="ghost" onClick={reset}>
              <IconRestore />
              {t('access-reset', 'Reset to template access')}
            </Button>
          ) : (
            <span />
          )}
          <Button disabled={update.isPending} onClick={save}>
            {update.isPending && <Spinner size="sm" />}
            {t('save', 'Save')}
          </Button>
        </div>
      )}
      <TryKey apiKey={apiKey} />
    </div>
  );
};
