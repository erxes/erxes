import {
  IconAlertTriangle,
  IconCopy,
  IconRefresh,
  IconTrash,
  IconWorldWww,
} from '@tabler/icons-react';
import {
  Alert,
  Badge,
  Button,
  CopyText,
  Input,
  Label,
  Skeleton,
  Spinner,
  useConfirm,
} from 'erxes-ui';
import { KeyboardEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useWebCustomDomainActions,
  useWebCustomDomains,
} from '../hooks/useWebCustomDomains';
import { IWebCustomDomain } from '../types';

const Status = ({ active }: { active: boolean }) => {
  const { t } = useTranslation('content');

  return (
    <Badge
      variant={active ? 'success' : 'warning'}
      className="uppercase shrink-0"
    >
      {active ? t('active', 'Active') : t('pending', 'Pending')}
    </Badge>
  );
};

// Long TXT values have no spaces, so the text itself must be allowed to break.
const Copyable = ({ value }: { value: string }) => (
  <CopyText
    value={value}
    className="min-w-0 max-w-full text-left font-mono text-xs hover:text-primary"
  >
    <span className="min-w-0 break-all [overflow-wrap:anywhere]">{value}</span>
    <IconCopy className="size-3.5 shrink-0 text-muted-foreground" />
  </CopyText>
);

const DomainItem = ({
  webId,
  domain,
}: {
  webId: string;
  domain: IWebCustomDomain;
}) => {
  const { t } = useTranslation('content');
  const { confirm } = useConfirm();
  const { refreshDomain, removeDomain, refreshing, removing } =
    useWebCustomDomainActions(webId);

  const busy = refreshing || removing;

  const onRemove = async () => {
    try {
      await confirm({
        message: t(
          'web-domain-remove-confirm',
          'Disconnect {{name}}? It will stop showing this website.',
          { name: domain.name },
        ),
      });
    } catch {
      return;
    }

    removeDomain(domain.name);
  };

  return (
    <li className="flex flex-col gap-3 p-3 rounded-lg border">
      <div className="flex gap-2 items-center">
        <IconWorldWww className="size-4 shrink-0 text-muted-foreground" />
        <a
          href={`https://${domain.name}`}
          target="_blank"
          rel="noreferrer"
          className="flex-1 min-w-0 text-sm font-medium truncate hover:underline"
        >
          {domain.name}
        </a>
        <Status active={domain.isActive} />
      </div>

      {!domain.isActive && (
        <ul className="rounded-md border divide-y">
          {domain.records.map((record) => (
            <li
              key={`${record.type}-${record.name}-${record.value}`}
              className="flex flex-col gap-1.5 p-2.5"
            >
              <div className="flex gap-2 justify-between items-center">
                <span className="text-xs font-medium">{record.type}</span>
                <Status active={record.status === 'active'} />
              </div>
              <dl className="grid grid-cols-[3.5rem_1fr] gap-x-2 gap-y-1 text-xs">
                <dt className="text-muted-foreground">{t('name')}</dt>
                <dd className="min-w-0">
                  <Copyable value={record.name} />
                </dd>
                <dt className="text-muted-foreground">{t('value', 'Value')}</dt>
                <dd className="min-w-0">
                  <Copyable value={record.value} />
                </dd>
              </dl>
            </li>
          ))}
        </ul>
      )}

      <div className="flex gap-2 justify-end">
        {!domain.isActive && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => refreshDomain(domain.name)}
            disabled={busy}
          >
            {refreshing ? <Spinner size="sm" /> : <IconRefresh />}
            {t('refresh', 'Refresh')}
          </Button>
        )}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onRemove}
          disabled={busy}
        >
          {removing ? <Spinner size="sm" /> : <IconTrash />}
          {t('remove')}
        </Button>
      </div>
    </li>
  );
};

const AddDomain = ({ webId }: { webId: string }) => {
  const { t } = useTranslation('content');
  const [hostname, setHostname] = useState('');
  const { addDomain, adding } = useWebCustomDomainActions(webId);

  // Rendered inside the web form: Enter adds the domain instead of saving it.
  const add = () =>
    hostname.trim() &&
    addDomain(hostname.trim()).then(({ errors }) => !errors && setHostname(''));

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      add();
    }
  };

  return (
    <div className="flex gap-2">
      <Input
        value={hostname}
        onChange={(event) => setHostname(event.target.value)}
        onKeyDown={onKeyDown}
        placeholder="www.example.com"
        autoComplete="off"
        spellCheck={false}
        aria-label={t('custom-domain', 'Custom domain')}
      />
      <Button type="button" onClick={add} disabled={adding || !hostname.trim()}>
        {adding && <Spinner size="sm" />}
        {t('add', 'Add')}
      </Button>
    </div>
  );
};

/**
 * Custom domains of a deployed web. The site runs on Vercel, so Vercel owns
 * the domain check and the certificate; this only lists what it reports.
 */
export const WebCustomDomain = ({ webId }: { webId: string }) => {
  const { t } = useTranslation('content');
  const { customDomains, loading, error, refetch } = useWebCustomDomains(webId);

  const renderBody = () => {
    if (loading && !customDomains) {
      return <Skeleton className="w-full h-16" />;
    }

    if (error && !customDomains) {
      return (
        <Alert variant="destructive">
          <IconAlertTriangle />
          <Alert.Title>
            {t('web-domain-load-error', 'Could not load the domains')}
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

    if (!customDomains?.isDeployed) {
      return (
        <p className="text-sm text-muted-foreground">
          {t(
            'web-domain-not-deployed',
            'Deploy the website first, then connect your domain here.',
          )}
        </p>
      );
    }

    return (
      <>
        {customDomains.defaultDomain && (
          <p className="text-sm text-muted-foreground">
            {t('web-domain-default', 'Always available at')}{' '}
            <a
              href={`https://${customDomains.defaultDomain}`}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-foreground hover:underline"
            >
              {customDomains.defaultDomain}
            </a>
          </p>
        )}

        {!!customDomains.domains.length && (
          <ul className="flex flex-col gap-2">
            {customDomains.domains.map((domain) => (
              <DomainItem key={domain.name} webId={webId} domain={domain} />
            ))}
          </ul>
        )}

        {customDomains.domains.some((domain) => !domain.isActive) && (
          <p className="text-xs text-muted-foreground">
            {t(
              'web-domain-dns-hint',
              'Add the records above at your DNS provider. Checks can take a few minutes; press Refresh to check again. On Cloudflare, set records to "DNS only" (grey cloud).',
            )}
          </p>
        )}

        <AddDomain webId={webId} />
      </>
    );
  };

  return (
    <section className="flex flex-col gap-3 pt-4 border-t">
      <div className="space-y-1">
        <Label>{t('custom-domain', 'Custom domain')}</Label>
        <p className="text-sm text-muted-foreground">
          {t(
            'web-domain-description',
            'Show this website on your own domain, such as www.example.com.',
          )}
        </p>
      </div>
      {renderBody()}
    </section>
  );
};
