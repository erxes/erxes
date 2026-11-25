import type { GithubAppFacts } from '@erxes/core-contract';
import { messageOf, orpc } from '@erxes/core-contract/client';
import { IconBrandGithub, IconCopy, IconExternalLink } from '@tabler/icons-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, CopyText, Input, Label, Textarea, useToast } from 'erxes-ui';
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { OverviewSection } from '../integrations/IntegrationLayout';
import { ClientSecretInput } from './SignInForm';

const NEW_APP = 'https://github.com/settings/apps/new';

/** The organisation's own App on the GitHub page: which one, and removing it while unused. */
export const GithubAppSummary = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.github-app' });
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const app = useQuery(orpc.githubApp.app.queryOptions());

  const remove = useMutation(
    orpc.githubApp.removeApp.mutationOptions({
      onSuccess: (facts) => queryClient.setQueryData(orpc.githubApp.app.queryKey(), facts),
      onError: (error) => toast({ variant: 'destructive', title: messageOf(error) }),
    }),
  );

  if (app.data?.source !== 'organization') return null;

  return (
    <OverviewSection title={t('app', 'GitHub App')}>
      <div className="flex items-center gap-3 rounded-lg border p-3 text-sm">
        <IconBrandGithub className="size-4 shrink-0 text-muted-foreground" />
        <span className="min-w-0 flex-1 truncate">
          <span className="font-medium">{app.data.slug}</span>
          <span className="text-muted-foreground">
            {' '}
            · {t('app-id-short', 'ID {{id}}', { id: app.data.appId })}
          </span>
        </span>
        <Button
          size="sm"
          variant="ghost"
          disabled={app.data.inUse || remove.isPending}
          title={app.data.inUse ? t('app-in-use', 'Remove its connections first') : undefined}
          onClick={() => remove.mutate({})}
        >
          {t('remove-app', 'Remove')}
        </Button>
      </div>
    </OverviewSection>
  );
};

/** Where to make the App, and the Callback URL to give it. */
const AppSetupHead = ({ callbackUrl }: { callbackUrl: string }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.github-app' });

  return (
    <>
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium">{t('app', 'GitHub App')}</span>
        <a
          href={NEW_APP}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
        >
          {t('create-app', 'Create one')}
          <IconExternalLink className="size-3" />
        </a>
      </div>
      <div className="space-y-1.5">
        <Label>{t('callback-url', 'Callback URL')}</Label>
        <CopyText value={callbackUrl} className="w-full min-w-0">
          <span className="flex w-full min-w-0 items-start gap-2 rounded-md border bg-muted/40 px-2.5 py-1.5 text-left">
            <code className="min-w-0 flex-1 break-all text-xs">{callbackUrl}</code>
            <IconCopy className="size-4 shrink-0 text-muted-foreground" />
          </span>
        </CopyText>
      </div>
    </>
  );
};

/** The organisation's own GitHub App, for a server without one in its .env. */
export const GithubAppForm = ({ facts }: { facts: GithubAppFacts }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.github-app' });
  const id = useId();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [appId, setAppId] = useState(facts.appId ?? '');
  const [clientId, setClientId] = useState(facts.clientId ?? '');
  const [clientSecret, setClientSecret] = useState('');
  const [privateKey, setPrivateKey] = useState('');

  const save = useMutation(
    orpc.githubApp.setApp.mutationOptions({
      onSuccess: (saved) => {
        queryClient.setQueryData(orpc.githubApp.app.queryKey(), saved);
        toast({ title: t('app-saved', 'GitHub App {{slug}} is set', { slug: saved.slug }) });
      },
      onError: (error) => toast({ variant: 'destructive', title: messageOf(error) }),
    }),
  );

  const filled = [appId, clientId, clientSecret, privateKey].every((value) => value.trim());

  return (
    <div className="space-y-3 rounded-lg border p-3">
      <AppSetupHead callbackUrl={facts.callbackUrl} />
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1.5">
          <Label htmlFor={`${id}-app`}>{t('app-id', 'App ID')}</Label>
          <Input
            id={`${id}-app`}
            inputMode="numeric"
            placeholder="123456"
            value={appId}
            onChange={(event) => setAppId(event.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`${id}-client`}>{t('client-id', 'Client ID')}</Label>
          <Input
            id={`${id}-client`}
            placeholder="Iv23li…"
            value={clientId}
            onChange={(event) => setClientId(event.target.value)}
          />
        </div>
      </div>
      <ClientSecretInput
        id={`${id}-secret`}
        label={t('client-secret', 'Client secret')}
        value={clientSecret}
        onChange={setClientSecret}
      />
      <div className="space-y-1.5">
        <Label htmlFor={`${id}-key`}>{t('private-key', 'Private key')}</Label>
        <Textarea
          id={`${id}-key`}
          rows={4}
          spellCheck={false}
          placeholder="-----BEGIN RSA PRIVATE KEY-----"
          value={privateKey}
          onChange={(event) => setPrivateKey(event.target.value)}
        />
      </div>
      <Button
        className="w-full"
        disabled={!filled || save.isPending}
        onClick={() => save.mutate({ appId, clientId, clientSecret, privateKey })}
      >
        {t('save-app', 'Save App')}
      </Button>
    </div>
  );
};
