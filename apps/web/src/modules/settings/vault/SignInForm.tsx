import type { IntegrationScope, VaultConnection } from '@erxes/core-contract';
import { messageOf, orpc } from '@erxes/core-contract/client';
import { IconCopy, IconLogin2 } from '@tabler/icons-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, CopyText, Input, Label, useToast } from 'erxes-ui';
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Integration } from '../integrations/catalog';
import { useCan } from '~/modules/auth/session';
import { IntegrationMark, useIntegrationText } from '../integrations/IntegrationStatusBadge';
import { AppSetNote } from './AppSetNote';
import { ConnectionScopePicker, useConnectionScope } from './ConnectionScope';

type OAuthIntegration = Integration & { oauth: NonNullable<Integration['oauth']> };

/** An app's client secret: typed once, never shown back. */
export const ClientSecretInput = ({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}) => (
  <div className="space-y-1.5">
    <Label htmlFor={id}>{label}</Label>
    <Input
      id={id}
      type="password"
      autoComplete="off"
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  </div>
);

/** The organisation's own app: the redirect URL to give it, then its client id and secret. */
export const OAuthAppForm = ({ integration }: { integration: OAuthIntegration }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.oauth' });
  const id = useId();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [clientId, setClientId] = useState(integration.oauth.clientId ?? '');
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
      <ClientSecretInput
        id={`${id}-secret`}
        label={t('client-secret', 'Client secret')}
        value={clientSecret}
        onChange={setClientSecret}
      />
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

/** The account a sign-in connection is signed in as, as the app names it. */
export const signedInAccount = (connection: VaultConnection) =>
  typeof connection.settings.account === 'string' ? connection.settings.account : null;

/** Sends the member to the app's sign-in; the callback saves one connection per account. */
const useAuthorize = () => {
  const { toast } = useToast();

  return useMutation(
    orpc.integrations.authorize.mutationOptions({
      onSuccess: ({ url }) => window.location.assign(url),
      onError: (error) => toast({ variant: 'destructive', title: messageOf(error) }),
    }),
  );
};

/** Signs in again, to renew the sign-in or grant more (Facebook pages): the same connection. */
export const SignInAgain = ({
  integration,
  scope,
}: {
  integration: OAuthIntegration;
  scope: IntegrationScope;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.oauth' });
  const authorize = useAuthorize();

  return (
    <Button
      size="sm"
      variant="outline"
      disabled={!integration.oauth.client || authorize.isPending}
      onClick={() => authorize.mutate({ key: integration.key, scope })}
    >
      <IconLogin2 />
      {t('sign-in-again', 'Sign in again')}
    </Button>
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
  const brand = useIntegrationText()(integration).name;
  const authorize = useAuthorize();
  const { open, scope, setScope } = useConnectionScope(integration);
  const canSetApp = useCan()(integration.permission);

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center gap-3">
        <IntegrationMark integration={integration} />
        <span className="font-medium">{brand}</span>
      </div>
      {integration.oauth.client === null && canSetApp && <OAuthAppForm integration={integration} />}
      {integration.oauth.client === 'organization' && (
        <AppSetNote
          name={t('your-app', 'Your {{name}} app', { name: brand })}
          detail={integration.oauth.clientId}
        />
      )}
      <ConnectionScopePicker open={open} scope={scope} onChange={setScope} />
      <p className="text-sm text-muted-foreground">
        {t(
          'one-per-account',
          'Each account connects once, named after the account. Signing in again with an account renews its connection.',
        )}
      </p>
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button
          disabled={!integration.oauth.client || authorize.isPending}
          onClick={() => authorize.mutate({ key: integration.key, scope })}
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
