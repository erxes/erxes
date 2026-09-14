import { Button, Collapsible, Spinner } from 'erxes-ui';
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
      aria-label="Viber connection setup"
    >
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-semibold">
          {t('viber-connection-setup', { defaultValue: 'Connection setup' })}
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
        <>
          {[setup.webhookError, setup.mediaError, setup.storageError]
            .filter(Boolean)
            .map((issue) => (
              <p key={issue} role="status" className="text-muted-foreground">
                {issue}
              </p>
            ))}
          <Collapsible>
            <Collapsible.Trigger asChild>
              <Button variant="ghost" size="sm" className="px-0">
                <Collapsible.TriggerIcon />
                Technical details
              </Button>
            </Collapsible.Trigger>
            <Collapsible.Content>
              <dl className="grid gap-3 pt-3 sm:grid-cols-[8rem_1fr]">
                <dt className="text-muted-foreground">Webhook URL</dt>
                <dd className="break-all">
                  {setup.webhookUrl || 'Not configured'}
                </dd>
                <dt className="text-muted-foreground">Media hosts</dt>
                <dd>{setup.mediaHostnames.join(', ') || 'Not configured'}</dd>
                <dt className="text-muted-foreground">Storage provider</dt>
                <dd>{setup.storageProvider || 'Not configured'}</dd>
              </dl>
            </Collapsible.Content>
          </Collapsible>
        </>
      )}
    </section>
  );
};
