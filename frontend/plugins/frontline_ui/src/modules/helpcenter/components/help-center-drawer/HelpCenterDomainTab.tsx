import {
  IconAlertTriangle,
  IconCopy,
  IconRefresh,
  IconWorldWww,
} from '@tabler/icons-react';
import {
  Alert,
  Badge,
  Button,
  CopyText,
  InfoCard,
  Input,
  Label,
  Skeleton,
  Spinner,
  useConfirm,
} from 'erxes-ui';
import { TFunction } from 'i18next';
import { KeyboardEvent, useState } from 'react';
import {
  useCustomDomain,
  useCustomDomainActions,
} from '@/helpcenter/hooks/useCustomDomain';
import { ICustomDomain, ICustomDomainRecord } from '@/helpcenter/types';

const statusVariant = (status: string) => {
  if (status === 'active') {
    return 'success';
  }

  return status.startsWith('pending') ? 'warning' : 'destructive';
};

const StatusBadge = ({ status, t }: { status: string; t: TFunction }) => (
  <Badge variant={statusVariant(status)} className="uppercase shrink-0">
    {t(`customdomain-status-${status}`, status.replace(/_/g, ' '))}
  </Badge>
);

// Long TXT values have no spaces: the text itself must be allowed to break,
// or it spills over the neighbouring cell.
const Copyable = ({ value }: { value: string }) => (
  <CopyText
    value={value}
    className="min-w-0 max-w-full text-left font-mono text-xs hover:text-primary"
  >
    <span className="min-w-0 break-all [overflow-wrap:anywhere]">{value}</span>
    <IconCopy className="size-3.5 shrink-0 text-muted-foreground" />
  </CopyText>
);

// Stacked rows rather than a table: the drawer is narrow and the TXT values
// are long, so each record gets the full width.
const DnsRecord = ({
  record,
  t,
}: {
  record: ICustomDomainRecord;
  t: TFunction;
}) => (
  <li className="flex flex-col gap-2 p-3">
    <div className="flex gap-2 justify-between items-center">
      <span className="text-sm font-medium">{record.type}</span>
      <StatusBadge status={record.status} t={t} />
    </div>
    <dl className="grid grid-cols-[4rem_1fr] gap-x-3 gap-y-1 text-xs">
      <dt className="text-muted-foreground">
        {t('customdomain-name', 'Name')}
      </dt>
      <dd className="min-w-0">
        <Copyable value={record.name} />
      </dd>
      <dt className="text-muted-foreground">
        {t('customdomain-value', 'Value')}
      </dt>
      <dd className="min-w-0">
        <Copyable value={record.value} />
      </dd>
    </dl>
  </li>
);

const ConnectDomain = ({
  helpCenterId,
  t,
}: {
  helpCenterId: string;
  t: TFunction;
}) => {
  const [hostname, setHostname] = useState('');
  const { saveDomain, saving } = useCustomDomainActions(helpCenterId);

  // This tab sits inside the help center form, so it cannot be a form of its
  // own: Enter saves the domain instead of submitting the help center.
  const save = () => hostname.trim() && saveDomain(hostname.trim());

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      save();
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor="help-center-custom-domain">
        {t('customdomain-label', 'Custom domain')}
      </Label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          id="help-center-custom-domain"
          value={hostname}
          onChange={(event) => setHostname(event.target.value)}
          onKeyDown={onKeyDown}
          placeholder="help.yourcompany.com"
          autoComplete="off"
          spellCheck={false}
        />
        <Button
          type="button"
          onClick={save}
          disabled={saving || !hostname.trim()}
        >
          {saving && <Spinner size="sm" />}
          {t('save', 'Save')}
        </Button>
      </div>
      <p className="text-sm text-muted-foreground">
        {t(
          'customdomain-hint',
          'Use a subdomain such as help.yourcompany.com. Root domains need a DNS provider that supports CNAME flattening.',
        )}
      </p>
    </div>
  );
};

const ConnectedDomain = ({
  helpCenterId,
  domain,
  t,
}: {
  helpCenterId: string;
  domain: ICustomDomain;
  t: TFunction;
}) => {
  const { confirm } = useConfirm();
  const { refreshDomain, resetDomain, refreshing, resetting } =
    useCustomDomainActions(helpCenterId);

  const busy = refreshing || resetting;

  const onReset = async () => {
    try {
      await confirm({
        message: t(
          'customdomain-reset-confirm',
          'Disconnect {{hostname}}? Visitors to it will stop seeing your help center.',
          { hostname: domain.hostname },
        ),
      });
    } catch {
      return;
    }

    resetDomain();
  };

  return (
    <div className="flex flex-col gap-3 p-3 rounded-lg border sm:flex-row sm:items-center">
      <div className="flex flex-1 gap-3 items-center min-w-0">
        <IconWorldWww className="size-5 shrink-0 text-muted-foreground" />
        <div className="min-w-0">
          <a
            href={`https://${domain.hostname}`}
            target="_blank"
            rel="noreferrer"
            className="block font-medium truncate hover:underline"
          >
            {domain.hostname}
          </a>
          <p className="text-sm text-muted-foreground">
            {domain.isActive
              ? t(
                  'customdomain-live',
                  'Your help center is live on this domain.',
                )
              : t(
                  'customdomain-waiting',
                  'Waiting for DNS and the certificate to be verified.',
                )}
          </p>
        </div>
        <StatusBadge status={domain.isActive ? 'active' : 'pending'} t={t} />
      </div>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => refreshDomain()}
          disabled={busy}
        >
          {refreshing ? <Spinner size="sm" /> : <IconRefresh />}
          {t('customdomain-refresh', 'Refresh')}
        </Button>
        <Button
          type="button"
          variant="destructive"
          onClick={onReset}
          disabled={busy}
        >
          {resetting && <Spinner size="sm" />}
          {t('customdomain-reset', 'Reset Domain')}
        </Button>
      </div>
    </div>
  );
};

const DnsRecords = ({ domain, t }: { domain: ICustomDomain; t: TFunction }) => (
  <InfoCard title={t('customdomain-dns-title', 'DNS records')}>
    <InfoCard.Content className="gap-3">
      <p className="text-sm text-muted-foreground">
        {t(
          'customdomain-dns-description',
          'Add the records below at your DNS provider so {{hostname}} shows the help center at {{target}}.',
          { hostname: domain.hostname, target: domain.cnameTarget },
        )}
      </p>

      {!domain.isActive && (
        <Badge variant="info" className="block p-3 w-full h-auto font-normal">
          <p>
            {t(
              'customdomain-dns-order',
              'Add all records. The certificate TXT record can only be verified after the CNAME is active, and verification can take up to 24 hours. Statuses are checked every 10 minutes, or press Refresh.',
            )}
          </p>
          <p className="mt-1">
            {t(
              'customdomain-dns-cloudflare',
              'Using Cloudflare? Set the CNAME to "DNS only" (grey cloud).',
            )}
          </p>
        </Badge>
      )}

      {!!domain.verificationErrors?.length && (
        <Alert variant="destructive">
          <IconAlertTriangle />
          <Alert.Title>
            {t('customdomain-errors', 'Verification problems')}
          </Alert.Title>
          <Alert.Description>
            {domain.verificationErrors.map((message) => (
              <p key={message}>{message}</p>
            ))}
          </Alert.Description>
        </Alert>
      )}

      <ul className="rounded-lg border divide-y">
        {domain.records.map((record) => (
          <DnsRecord
            key={`${record.type}-${record.name}-${record.value}`}
            record={record}
            t={t}
          />
        ))}
      </ul>

      {domain.lastCheckedAt && (
        <p className="text-xs text-muted-foreground">
          {t('customdomain-last-checked', 'Last checked {{date}}', {
            date: new Date(domain.lastCheckedAt).toLocaleString(),
          })}
        </p>
      )}
    </InfoCard.Content>
  </InfoCard>
);

/**
 * This help center's own domain. Each help center has at most one, and a
 * workspace can connect one per help center.
 */
export function HelpCenterDomainTab({
  helpCenterId,
  t,
}: Readonly<{ helpCenterId: string; t: TFunction }>) {
  const { customDomain, loading, error, refetch } =
    useCustomDomain(helpCenterId);

  if (loading && !customDomain) {
    return (
      <div className="flex flex-col gap-3">
        <Skeleton className="w-40 h-5" />
        <Skeleton className="w-full h-9" />
        <Skeleton className="w-full h-32" />
      </div>
    );
  }

  if (error && !customDomain) {
    return (
      <Alert variant="destructive">
        <IconAlertTriangle />
        <Alert.Title>
          {t('customdomain-load-error', 'Could not load your custom domain')}
        </Alert.Title>
        <Alert.Description>
          <p>{error.message}</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => refetch()}
          >
            {t('retry', 'Try again')}
          </Button>
        </Alert.Description>
      </Alert>
    );
  }

  if (!customDomain?.isAvailable) {
    return (
      <p className="p-8 text-sm text-center text-muted-foreground">
        {t(
          'customdomain-unavailable-description',
          'Custom help center domains are part of erxes Cloud. On a self-hosted installation, point your domain at the help center in your own reverse proxy.',
        )}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <InfoCard title={t('customdomain-title', 'Custom Domain')}>
        <InfoCard.Content className="gap-4">
          <p className="text-sm text-muted-foreground">
            {t(
              'customdomain-description',
              'Serve this help center from your own domain, such as help.yourcompany.com. Each help center can have its own domain, and visitors stay on it.',
            )}
          </p>
          {customDomain.hostname ? (
            <ConnectedDomain
              helpCenterId={helpCenterId}
              domain={customDomain}
              t={t}
            />
          ) : (
            <ConnectDomain helpCenterId={helpCenterId} t={t} />
          )}
        </InfoCard.Content>
      </InfoCard>

      {customDomain.hostname && <DnsRecords domain={customDomain} t={t} />}
    </div>
  );
}
