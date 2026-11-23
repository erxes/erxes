import { messageOf, orpc } from '@erxes/core-contract/client';
import { IconCopy, IconLogin2 } from '@tabler/icons-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, CopyText, Input, Label, useToast } from 'erxes-ui';
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Integration } from '../integrations/catalog';
import { IntegrationMark, useIntegrationText } from '../integrations/IntegrationStatusBadge';
import { ConnectionNameInput, useConnectionName } from './ConnectionName';

type OAuthIntegration = Integration & { oauth: NonNullable<Integration['oauth']> };

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
