import { Button, Spinner } from 'erxes-ui';
import type { ViberSetup } from '../types';
import { useTranslation } from 'react-i18next';

export const ViberSetupCheck = ({
  setup,
  loading,
  error,
  refresh,
}: {
  setup?: ViberSetup;
  loading: boolean;
  error?: string;
  refresh: () => void;
}) => {
  const { t } = useTranslation('frontline');
  return (
    <section
      className="rounded-lg border p-4 space-y-3 text-sm"
      aria-label="Viber server setup"
    >
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-semibold">
          {t('viber-server-setup', { defaultValue: 'Server setup' })}
        </h3>
        <Button variant="ghost" size="sm" onClick={refresh} disabled={loading}>
          {loading && <Spinner size="sm" />}
          {t('refresh', { defaultValue: 'Refresh' })}
        </Button>
      </div>
      {error && (
        <p role="alert" className="text-destructive">
          {error}
        </p>
      )}
      {setup && (
        <dl className="grid gap-3 sm:grid-cols-[8rem_1fr]">
          <dt className="text-muted-foreground">Webhook</dt>
          <dd className="break-all">
            {setup.webhookError || setup.webhookUrl}
          </dd>
          <dt className="text-muted-foreground">Incoming media</dt>
          <dd>{setup.mediaError || setup.mediaHostnames.join(', ')}</dd>
          <dt className="text-muted-foreground">File storage</dt>
          <dd>
            {setup.storageError ||
              `${setup.storageProvider} configured — upload/download test still required.`}
          </dd>
        </dl>
      )}
      <p className="text-muted-foreground">
        {t('viber-setup-note', {
          defaultValue:
            'The bot token belongs to each integration. Media hosts are a server-admin security policy, not a bot credential. These checks read configuration; they do not prove a live Viber connection or working storage.',
        })}
      </p>
    </section>
  );
};
