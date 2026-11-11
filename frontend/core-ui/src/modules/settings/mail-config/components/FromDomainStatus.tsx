import {
  IconCheck,
  IconLoader2,
  IconRefresh,
  IconX,
} from '@tabler/icons-react';
import { Badge, Button, Skeleton, cn } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import {
  IFromDomainCheck,
  TFromDomainState,
  useFromDomainCheck,
} from '@/settings/mail-config/hooks/useFromDomainCheck';

const STATE_BADGE: Record<
  TFromDomainState,
  'success' | 'warning' | 'destructive' | 'secondary'
> = {
  verified: 'success',
  pending: 'warning',
  failed: 'destructive',
  missing: 'destructive',
  unchecked: 'secondary',
};

const messageKey = ({ state, region }: IFromDomainCheck) =>
  state === 'missing' && region
    ? 'from-domain-missing-region'
    : `from-domain-${state}`;

export const FromDomainStatus = ({ className }: { className?: string }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'mail-config' });
  const { check, error, loading, rechecking, recheck } = useFromDomainCheck();

  if (loading) {
    return <Skeleton className={cn('h-20 rounded-lg', className)} />;
  }

  if (!check && !error) {
    return null;
  }

  const showRecords =
    check &&
    (check.state === 'pending' || check.state === 'failed') &&
    check.dnsRecords.length > 0;

  return (
    <div className={cn('flex flex-col gap-2 rounded-lg border p-3', className)}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0 flex-wrap">
          <span className="text-sm font-medium">{t('from-domain')}</span>
          {check && (
            <>
              <span className="text-sm text-muted-foreground break-all">
                {check.region
                  ? `${check.domain} · ${check.region}`
                  : check.domain}
              </span>
              <Badge variant={STATE_BADGE[check.state]}>
                {t(`from-domain-state-${check.state}`)}
              </Badge>
            </>
          )}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={recheck}
          disabled={rechecking}
        >
          {rechecking ? (
            <IconLoader2 className="animate-spin" />
          ) : (
            <IconRefresh />
          )}
          {t('recheck')}
        </Button>
      </div>

      {error ? (
        <p className="text-sm text-destructive">
          {t('from-domain-load-failed', { error: error.message })}
        </p>
      ) : (
        check && (
          <p className="text-sm text-muted-foreground">
            {t(messageKey(check), {
              domain: check.domain,
              region: check.region,
              error: check.error,
            })}
            {check.state === 'unchecked' && check.region && (
              <> {t('from-domain-unchecked-hint')}</>
            )}
          </p>
        )
      )}

      {!!check?.otherVerifiedDomains?.length && (
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-sm text-muted-foreground">
            {t('from-domain-others')}
          </span>
          {check.otherVerifiedDomains.map((domain) => (
            <Badge key={domain} variant="secondary">
              {domain}
            </Badge>
          ))}
        </div>
      )}

      {check?.listError && (
        <p className="text-xs text-muted-foreground">
          {t('from-domain-list-failed', { domain: check.domain })}
          {check.region && <> {t('from-domain-list-failed-hint')}</>}
        </p>
      )}

      {showRecords && (
        <ul className="flex flex-col gap-1">
          {check.dnsRecords.map((record) => (
            <li
              key={record.host}
              className="grid grid-cols-[auto_auto_1fr] items-start gap-2 text-xs font-mono"
            >
              {record.valid ? (
                <IconCheck className="size-3.5 text-success" />
              ) : (
                <IconX className="size-3.5 text-destructive" />
              )}
              <span className="text-muted-foreground">{record.type}</span>
              <span className="break-all">
                {record.host} → {record.data}
              </span>
            </li>
          ))}
        </ul>
      )}

      <span className="text-xs text-muted-foreground">
        {t('from-domain-saved-note')}
      </span>
    </div>
  );
};
