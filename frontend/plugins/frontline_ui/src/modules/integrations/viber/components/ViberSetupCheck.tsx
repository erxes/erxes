import { Button, Collapsible, CopyText, Skeleton, Spinner } from 'erxes-ui';
import type { ViberSetup } from '../types';
import { useTranslation } from 'react-i18next';
import { IconAlertTriangle, IconCopy, IconRefresh } from '@tabler/icons-react';
import { Link } from 'react-router-dom';

export const ViberSetupCheck = ({
  setup,
  loading,
  error,
  refresh,
  canEdit = false,
}: {
  setup?: ViberSetup;
  loading: boolean;
  error?: string;
  refresh: () => void;
  canEdit?: boolean;
}) => {
  const { t } = useTranslation('frontline');
  const issues = [
    { label: 'Webhook', message: setup?.webhookError },
    { label: 'Incoming media', message: setup?.mediaError },
    { label: 'File storage', message: setup?.storageError },
  ].filter((issue) => issue.message);
  const providers: Record<string, string> = {
    AWS: 'S3-compatible storage',
    GCS: 'Google Cloud Storage',
    CLOUDFLARE: 'Cloudflare',
    AZURE: 'Azure',
    LOCAL: 'Local',
  };
  return (
    <section
      className="border-y py-4 space-y-3 text-sm"
      aria-label="Viber connection setup"
      aria-busy={loading}
    >
      <div className="flex items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 font-medium">
          {(issues.length > 0 || error) && (
            <IconAlertTriangle
              className="size-4 text-warning"
              aria-hidden="true"
            />
          )}
          {t('viber-connection-setup', { defaultValue: 'Connection setup' })}
        </h3>
        <Button
          variant="ghost"
          size="sm"
          className="h-7"
          onClick={refresh}
          disabled={loading}
        >
          {loading ? (
            <Spinner size="sm" />
          ) : (
            <IconRefresh className="size-3.5" aria-hidden="true" />
          )}
          {t('refresh', { defaultValue: 'Refresh' })}
        </Button>
      </div>
      {error && (
        <p role="alert" className="text-destructive">
          {error}
        </p>
      )}
      {loading && !setup && !error && (
        <div
          role="status"
          aria-label="Loading connection setup"
          className="space-y-2"
        >
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      )}
      {setup && (
        <>
          {issues.length > 0 && (
            <ul className="space-y-2" aria-label="Setup issues">
              {issues.map((issue) => (
                <li
                  key={issue.label}
                  className="grid gap-1 sm:grid-cols-[7rem_1fr] sm:gap-3"
                >
                  <span className="font-medium">{issue.label}</span>
                  <span className="text-muted-foreground leading-relaxed">
                    {issue.message}
                  </span>
                </li>
              ))}
            </ul>
          )}
          {canEdit && (
            <Button asChild variant="link" size="sm" className="h-auto p-0">
              <Link to="/settings/frontline/config">
                {t('viber-manage-media-hosts', {
                  defaultValue: 'Manage media hosts',
                })}
              </Link>
            </Button>
          )}
          <Collapsible>
            <Collapsible.Trigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-0 text-muted-foreground"
              >
                <Collapsible.TriggerIcon className="size-3.5" />
                Technical details
              </Button>
            </Collapsible.Trigger>
            <Collapsible.Content>
              <dl className="grid gap-x-3 gap-y-2 pt-3 sm:grid-cols-[7rem_minmax(0,1fr)]">
                <dt className="text-muted-foreground">Webhook URL</dt>
                <dd className="min-w-0">
                  {setup.webhookUrl ? (
                    <CopyText
                      value={setup.webhookUrl}
                      className="w-full min-w-0 justify-between gap-3 rounded-sm text-xs font-mono hover:text-primary"
                    >
                      <span className="truncate">{setup.webhookUrl}</span>
                      <IconCopy
                        className="size-3.5 shrink-0"
                        aria-hidden="true"
                      />
                      <span className="sr-only">Copy webhook URL</span>
                    </CopyText>
                  ) : (
                    'Not configured'
                  )}
                </dd>
                <dt className="text-muted-foreground">Media hosts</dt>
                <dd className="break-words text-xs font-mono">
                  {setup.mediaHostnames.join(', ') || 'Not configured'}
                </dd>
                <dt className="text-muted-foreground">Storage provider</dt>
                <dd>
                  {setup.storageProvider
                    ? providers[setup.storageProvider] || setup.storageProvider
                    : 'Not configured'}
                </dd>
              </dl>
            </Collapsible.Content>
          </Collapsible>
        </>
      )}
    </section>
  );
};
