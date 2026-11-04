import { IconRefresh } from '@tabler/icons-react';
import { Badge, Button, RelativeDateDisplay, Spinner, toast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { MembersInline } from 'ui-modules';
import {
  useLdapConfig,
  useLdapRecheckNow,
} from '@/settings/ldap/hooks/useLdapConfig';
import { ILdapRecheckChange } from '@/settings/ldap/types';

const toIso = (value: string) => new Date(value).toISOString();

const When = ({ value }: { value: string }) => (
  <RelativeDateDisplay value={toIso(value)}>
    <RelativeDateDisplay.Value value={toIso(value)} />
  </RelativeDateDisplay>
);

const ChangeRow = ({ change }: { change: ILdapRecheckChange }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'ldap' });

  return (
    <li className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2 text-sm">
      <div className="min-w-0 flex-1">
        <MembersInline memberIds={[change.userId]} />
      </div>
      <span className="text-muted-foreground">
        {t(`recheck-reason-${change.reason}`)}
      </span>
      {change.signedOut && (
        <Badge variant="secondary">{t('recheck-signed-out')}</Badge>
      )}
      <span className="text-muted-foreground">
        <When value={change.at} />
      </span>
    </li>
  );
};

/** What the scheduled directory check last did and when it runs next. */
export const LdapRecheckStatus = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'ldap' });
  const { config } = useLdapConfig();
  const { recheck, loading } = useLdapRecheckNow();

  if (!config?.enabled) return null;

  const { lastRecheck, nextRecheckAt, recheckChanges } = config;

  const runNow = () =>
    recheck({
      onCompleted: (data) => {
        const run = data?.authLdapRecheckNow?.lastRecheck;

        toast(
          run?.status === 'failed'
            ? {
                title: run.error || t('recheck-failed'),
                variant: 'destructive',
              }
            : { title: t('recheck-done'), variant: 'success' },
        );
      },
      onError: (e) => toast({ title: e.message, variant: 'destructive' }),
    });

  return (
    <section className="flex flex-col gap-4 rounded-lg border p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h3 className="text-sm font-semibold">{t('recheck-status-title')}</h3>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            {lastRecheck ? (
              <span className="flex items-center gap-2">
                {t('recheck-last-run')} <When value={lastRecheck.at} />
                <Badge
                  variant={
                    lastRecheck.status === 'failed' ? 'destructive' : 'success'
                  }
                >
                  {lastRecheck.status === 'failed'
                    ? t('recheck-status-failed')
                    : t('recheck-checked', { count: lastRecheck.checked })}
                </Badge>
              </span>
            ) : (
              <span>{t('recheck-never-run')}</span>
            )}
            <span>
              {config.recheckEveryMinutes && nextRecheckAt ? (
                <>
                  {t('recheck-next-run')} <When value={nextRecheckAt} />
                </>
              ) : (
                t('recheck-not-scheduled')
              )}
            </span>
          </div>
          {lastRecheck?.status === 'failed' && lastRecheck.error && (
            <p className="text-sm text-destructive">{lastRecheck.error}</p>
          )}
        </div>
        <Button variant="outline" disabled={loading} onClick={runNow}>
          {loading ? <Spinner size="sm" /> : <IconRefresh />}
          {t('recheck-now')}
        </Button>
      </div>

      {recheckChanges.length ? (
        <ul className="divide-y">
          {recheckChanges.map((change) => (
            <ChangeRow key={`${change.userId}-${change.at}`} change={change} />
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">
          {t('recheck-no-changes')}
        </p>
      )}
    </section>
  );
};
