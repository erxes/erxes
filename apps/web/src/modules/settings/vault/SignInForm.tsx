import { messageOf, orpc } from '@erxes/core-contract/client';
import { IconCopy, IconLogin2 } from '@tabler/icons-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, CopyText, Input, Label, useToast } from 'erxes-ui';
import { type ReactNode, useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Integration } from '../integrations/catalog';
import { IntegrationMark, useIntegrationText } from '../integrations/IntegrationStatusBadge';
import { ConnectionNameInput, useConnectionName } from './ConnectionName';

type OAuthIntegration = Integration & { oauth: NonNullable<Integration['oauth']> };

const OAuthAppForm = ({ integration }: { integration: OAuthIntegration }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.oauth' });
  const id = useId();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');

  const save = useMutation(
    orpc.integrations.setOAuthApp.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: orpc.integrations.list.key() });
        toast({ title: t('app-saved', 'Saved. You can sign in now.') });
      },
      onError: (error) => toast({ variant: 'destructive', title: messageOf(error) }),
    }),
  );

  return (
    <div className="space-y-3 rounded-lg border p-3">
      <p className="text-sm text-muted-foreground">
        {t(
          'app-needed',
          'First create an app in your developer account and add this address as its redirect URL. Then paste its client id and secret.',
        )}
      </p>
      <CopyText value={integration.oauth.callbackUrl} className="w-full min-w-0">
        <span className="flex w-full min-w-0 items-start gap-2 rounded-md border bg-muted/40 px-2.5 py-1.5 text-left">
          <code className="min-w-0 flex-1 break-all text-xs">{integration.oauth.callbackUrl}</code>
          <IconCopy className="size-4 shrink-0 text-muted-foreground" />
        </span>
      </CopyText>
      <div className="space-y-1.5">
        <Label htmlFor={`${id}-client`}>{t('client-id', 'Client id')}</Label>
        <Input
          id={`${id}-client`}
          value={clientId}
          onChange={(event) => setClientId(event.target.value)}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={`${id}-secret`}>{t('client-secret', 'Client secret')}</Label>
        <Input
          id={`${id}-secret`}
          type="password"
          autoComplete="off"
          value={clientSecret}
          onChange={(event) => setClientSecret(event.target.value)}
        />
      </div>
      <Button
        variant="outline"
        disabled={!clientId.trim() || !clientSecret.trim() || save.isPending}
        onClick={() =>
          save.mutate({
            key: integration.key,
            clientId: clientId.trim(),
            clientSecret: clientSecret.trim(),
          })
        }
      >
        {t('save-app', 'Save app')}
      </Button>
    </div>
  );
};

const Fact = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5">
    <dt className="text-muted-foreground">{label}</dt>
    <dd className="min-w-0 break-all text-right">{children}</dd>
  </div>
);

export const ServerAppFacts = ({ oauth }: { oauth: OAuthIntegration['oauth'] }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.oauth' });

  if (oauth.client !== 'server' || !oauth.serverClientId) return null;

  return (
    <div className="space-y-2 rounded-lg border p-3 text-sm">
      <dl className="space-y-1.5">
        <Fact label={t('app', 'App')}>{t('app-on-server', 'Set on the server')}</Fact>
        {oauth.serverClientId && (
          <Fact label={t('client-id', 'Client id')}>
            <code className="text-xs">{oauth.serverClientId}</code>
          </Fact>
        )}
        {oauth.relayUrl && (
          <>
            <Fact label={t('relay', 'Events and sign-in')}>
              {t('through-relay', 'Through the erxes Meta relay')}
            </Fact>
            <Fact label={t('relay-url', 'Relay')}>
              <code className="text-xs">{oauth.relayUrl}</code>
            </Fact>
          </>
        )}
      </dl>
      <p className="text-xs text-muted-foreground">
        {t('server-app-note', "Set in the server's .env. Change it there.")}
      </p>
    </div>
  );
};

export const SignInForm = ({
  integration,
  onCancel,
}: {
  integration: OAuthIntegration;
  onCancel: () => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.oauth' });
  const id = useId();
  const { toast } = useToast();
  const brand = useIntegrationText()(integration).name;
  const { name, setName, taken, ready } = useConnectionName(integration);

  const authorize = useMutation(
    orpc.integrations.authorize.mutationOptions({
      onSuccess: ({ url }) => window.location.assign(url),
      onError: (error) => toast({ variant: 'destructive', title: messageOf(error) }),
    }),
  );

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center gap-3">
        <IntegrationMark integration={integration} />
        <span className="font-medium">{brand}</span>
      </div>
      {integration.oauth.client === null && <OAuthAppForm integration={integration} />}
      <ServerAppFacts oauth={integration.oauth} />
      <ConnectionNameInput
        id={`${id}-name`}
        integration={integration}
        name={name}
        taken={taken}
        onChange={setName}
      />
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button
          disabled={!integration.oauth.client || !ready || authorize.isPending}
          onClick={() => authorize.mutate({ key: integration.key, name: name.trim() })}
        >
          <IconLogin2 />
          {t('sign-in', 'Sign in with {{name}}', { name: brand })}
        </Button>
      </div>
    </div>
  );
};

export const isOAuthIntegration = (integration: Integration): integration is OAuthIntegration =>
  integration.oauth !== null;
