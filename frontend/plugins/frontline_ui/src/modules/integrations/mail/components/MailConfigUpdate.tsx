import {
  IconAlertTriangle,
  IconCircleCheck,
  IconCircleDashed,
  IconExternalLink,
  IconPlugConnected,
  IconRefresh,
  IconTrash,
} from '@tabler/icons-react';
import {
  Alert,
  Button,
  Collapsible,
  Form,
  getPluginAssetsUrl,
  Select,
  Skeleton,
  Spinner,
  toast,
  useConfirm,
} from 'erxes-ui';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { IntegrationLogo } from '@/integrations/components/IntegrationLogo';
import { SecretInput } from '@/integrations/components/SecretInput';
import { INTEGRATIONS } from '@/integrations/constants/integrations';
import { IntegrationType } from '@/types/Integration';
import {
  IMailCloudflareConnection,
  IMailProvisionStep,
  useMailCloudflareConnection,
} from '../hooks/useMailCloudflareConnection';
import { useMailCloudflareSendingQuota } from '../hooks/useMailCloudflareSendingQuota';
import { useMailCloudflareSetup } from '../hooks/useMailCloudflareSetup';

const TOKEN_PERMISSIONS = [
  { key: 'workers_scripts', type: 'edit' },
  { key: 'workers_r2', type: 'edit' },
  { key: 'queues', type: 'edit' },
  { key: 'zone', type: 'read' },
  { key: 'dns', type: 'edit' },
  { key: 'zone_settings', type: 'edit' },
  { key: 'email_sending', type: 'edit' },
  { key: 'email_routing_rule', type: 'edit' },
];

const CLOUDFLARE_TOKEN_URL = `https://dash.cloudflare.com/profile/api-tokens?${new URLSearchParams(
  {
    permissionGroupKeys: JSON.stringify(TOKEN_PERMISSIONS),
    accountId: '*',
    zoneId: 'all',
    name: 'erxes mail',
  },
).toString()}`;

const SENDING_STEPS = ['enableEmailSending', 'checkSendingDns'];

const connectSchema = z.object({
  token: z.string().min(1),
  zoneId: z.string().min(1),
});

type ConnectValues = z.infer<typeof connectSchema>;

export const MailConfigUpdateCollapse = () => {
  return (
    <Collapsible className="w-full bg-muted rounded-lg">
      <Collapsible.Trigger asChild>
        <Button
          variant="secondary"
          className="w-full h-auto flex justify-start group bg-transparent hover:bg-transparent gap-3 px-3 font-semibold"
        >
          <Collapsible.TriggerIcon className="text-accent-foreground" />
          <IntegrationLogo
            img={getPluginAssetsUrl(
              'frontline',
              INTEGRATIONS[IntegrationType.MAIL].img,
            )}
            name={INTEGRATIONS[IntegrationType.MAIL].name}
          />
          {INTEGRATIONS[IntegrationType.MAIL].name}
        </Button>
      </Collapsible.Trigger>
      <Collapsible.Content className="shadow-xs rounded-lg p-3 bg-background">
        <MailConfigUpdate />
      </Collapsible.Content>
    </Collapsible>
  );
};

const StepIcon = ({ state }: { state: IMailProvisionStep['state'] }) => {
  if (state === 'ok') {
    return <IconCircleCheck size={15} className="text-success shrink-0" />;
  }

  if (state === 'failed') {
    return (
      <IconAlertTriangle size={15} className="text-destructive shrink-0" />
    );
  }

  return (
    <IconCircleDashed size={15} className="text-muted-foreground shrink-0" />
  );
};

const ProvisionSteps = ({ steps }: { steps: IMailProvisionStep[] }) => {
  const { t } = useTranslation('frontline');

  if (!steps.length) {
    return null;
  }

  return (
    <div className="space-y-1">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {t('cloudflare-setup-steps')}
      </p>
      <ul className="space-y-1">
        {steps.map((step) => (
          <li key={step.name} className="flex items-start gap-2 text-sm">
            <span className="pt-0.5">
              <StepIcon state={step.state} />
            </span>
            <span className="font-mono text-xs leading-5">{step.name}</span>
            {step.error && (
              <span className="text-xs text-destructive">{step.error}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

const SendingStatus = ({
  connection,
}: {
  connection: IMailCloudflareConnection;
}) => {
  const { t } = useTranslation('frontline');
  const enabled = Boolean(connection.sendingEnabled);
  const { quota } = useMailCloudflareSendingQuota(!enabled);

  const failure = (connection.steps ?? []).find(
    (step) => SENDING_STEPS.includes(step.name) && step.state === 'failed',
  )?.error;

  return (
    <>
      <p className="text-muted-foreground">
        {t('mail-sending')}:{' '}
        {enabled
          ? t('mail-sending-active', { domain: connection.zoneName })
          : t('mail-sending-inactive')}
      </p>
      {enabled && quota && (
        <p className="text-muted-foreground">
          {t('mail-sending-quota')}:{' '}
          {t('mail-sending-quota-value', {
            value: quota.value.toLocaleString(),
            unit: t(`mail-quota-unit-${quota.unit}`, {
              defaultValue: quota.unit,
            }),
          })}
        </p>
      )}
      {!enabled && (
        <p className="text-muted-foreground">
          {failure ? `${failure} — ` : ''}
          {t('mail-sending-retry-hint')}
        </p>
      )}
    </>
  );
};

const ConnectedView = ({
  connection,
}: {
  connection: IMailCloudflareConnection;
}) => {
  const { t } = useTranslation('frontline');
  const { confirm } = useConfirm();
  const { provision, provisioning, disconnect, disconnecting } =
    useMailCloudflareSetup();

  const failed = connection.status === 'error';
  const outdated =
    connection.status === 'connected' &&
    Boolean(connection.currentScriptVersion) &&
    connection.scriptVersion !== connection.currentScriptVersion;

  const handleProvision = () =>
    provision().then((result) => {
      if (!result?.data) {
        return;
      }

      toast({ title: t('cloudflare-connected'), variant: 'success' });
    });

  const handleDisconnect = () =>
    confirm({ message: t('confirm-disconnect-cloudflare') }).then(() =>
      disconnect().then(() =>
        toast({ title: t('cloudflare-disconnected'), variant: 'success' }),
      ),
    );

  return (
    <div className="space-y-3">
      <Alert variant={failed ? 'destructive' : 'default'}>
        {failed ? (
          <IconAlertTriangle className="h-4 w-4" />
        ) : (
          <IconCircleCheck className="h-4 w-4" />
        )}
        <Alert.Title className="font-medium">
          {failed ? t('cloudflare-connect-failed') : t('cloudflare-connected')}
        </Alert.Title>
        <Alert.Description className="mt-1 space-y-1 text-sm">
          <p className="text-muted-foreground">
            {t('cloudflare-domain')}: <code>{connection.zoneName}</code>
          </p>
          {connection.accountName && (
            <p className="text-muted-foreground">
              {t('cloudflare-account')}: {connection.accountName}
            </p>
          )}
          {connection.workerOrigin && (
            <p className="break-all text-muted-foreground">
              {t('cloudflare-worker')}: <code>{connection.workerOrigin}</code>
            </p>
          )}
          {!failed && <SendingStatus connection={connection} />}
          {connection.error && <p>{connection.error}</p>}
        </Alert.Description>
      </Alert>

      {outdated && (
        <Alert>
          <IconRefresh className="h-4 w-4" />
          <Alert.Title className="font-medium">
            {t('cloudflare-update-available')}
          </Alert.Title>
        </Alert>
      )}

      <ProvisionSteps steps={connection.steps ?? []} />

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="secondary"
          onClick={handleProvision}
          disabled={provisioning || disconnecting}
        >
          {provisioning ? <Spinner /> : <IconRefresh size={16} />}
          {failed ? t('retry-setup') : t('update-worker')}
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="text-destructive"
          onClick={handleDisconnect}
          disabled={provisioning || disconnecting}
        >
          {disconnecting ? <Spinner /> : <IconTrash size={16} />}
          {t('disconnect')}
        </Button>
      </div>
    </div>
  );
};

const ConnectForm = () => {
  const { t } = useTranslation('frontline');
  const { loadZones, zones, loadingZones, connect, connecting } =
    useMailCloudflareSetup();

  const form = useForm<ConnectValues>({
    resolver: zodResolver(connectSchema),
    defaultValues: { token: '', zoneId: '' },
  });

  const token = form.watch('token');

  const handleLoadZones = () => {
    if (!token.trim()) {
      form.setError('token', { message: t('cloudflare-token-required') });
      return;
    }

    form.setValue('zoneId', '');
    loadZones({ variables: { token: token.trim() } });
  };

  const onSubmit = (values: ConnectValues) =>
    connect({ variables: values }).then((result) => {
      if (!result?.data) {
        return;
      }

      toast({ title: t('cloudflare-connected'), variant: 'success' });
    });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
        <p className="text-sm text-muted-foreground">
          {t('cloudflare-connect-description')}
        </p>

        <div className="space-y-2 rounded-lg border p-3">
          <p className="text-sm font-medium">{t('cloudflare-token-how')}</p>
          <Button variant="secondary" asChild className="w-full">
            <a
              href={CLOUDFLARE_TOKEN_URL}
              target="_blank"
              rel="noreferrer noopener"
            >
              <IconExternalLink size={16} />
              {t('create-token-on-cloudflare')}
            </a>
          </Button>
          <p className="text-xs text-muted-foreground">
            {t('cloudflare-token-link-description')}
          </p>
        </div>

        <Form.Field
          control={form.control}
          name="token"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('cloudflare-api-token')}</Form.Label>
              <Form.Control>
                <SecretInput {...field} />
              </Form.Control>
              <Form.Description>{t('cloudflare-token-help')}</Form.Description>
              <Form.Message />
            </Form.Item>
          )}
        />

        <Button
          type="button"
          variant="secondary"
          onClick={handleLoadZones}
          disabled={loadingZones || connecting}
        >
          {loadingZones ? <Spinner /> : <IconPlugConnected size={16} />}
          {loadingZones ? t('loading-domains') : t('load-domains')}
        </Button>

        {!loadingZones && !zones.length && form.formState.isSubmitted && (
          <Alert variant="destructive">
            <IconAlertTriangle className="h-4 w-4" />
            <Alert.Title className="font-medium">
              {t('cloudflare-no-domains')}
            </Alert.Title>
          </Alert>
        )}

        {zones.length > 0 && (
          <Form.Field
            control={form.control}
            name="zoneId"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>{t('cloudflare-domain')}</Form.Label>
                <Form.Control>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <Select.Trigger className="w-full">
                      <Select.Value placeholder={t('select-a-domain')} />
                    </Select.Trigger>
                    <Select.Content>
                      {zones.map((zone) => (
                        <Select.Item key={zone.id} value={zone.id}>
                          {zone.name}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select>
                </Form.Control>
                <Form.Description>
                  {t('cloudflare-domain-help')}
                </Form.Description>
                <Form.Message />
              </Form.Item>
            )}
          />
        )}

        {zones.length > 0 && (
          <Button type="submit" disabled={connecting}>
            {connecting ? <Spinner /> : null}
            {connecting ? t('connecting') : t('connect')}
          </Button>
        )}
      </form>
    </Form>
  );
};

export const MailConfigUpdate = () => {
  const { connection, loading } = useMailCloudflareConnection();

  if (loading && !connection) {
    return (
      <div className="flex flex-col gap-3">
        <Skeleton className="h-8" />
        <Skeleton className="h-8" />
        <Skeleton className="h-8" />
      </div>
    );
  }

  if (connection) {
    return <ConnectedView connection={connection} />;
  }

  return <ConnectForm />;
};
