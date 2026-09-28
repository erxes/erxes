import {
  IconAlertTriangle,
  IconInfoCircle,
  IconWorldWww,
} from '@tabler/icons-react';
import {
  Alert,
  Breadcrumb,
  Button,
  Empty,
  PageContainer,
  Separator,
  Skeleton,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { PageHeader, createFavoriteBreadcrumb } from 'ui-modules';
import { CustomDomainForm } from '@/customdomain/components/CustomDomainForm';
import { CustomDomainRecords } from '@/customdomain/components/CustomDomainRecords';
import { useCustomDomain } from '@/customdomain/hooks/useCustomDomain';
import { ICustomDomain } from '@/customdomain/types';

const DnsInstructions = ({ domain }: { domain: ICustomDomain }) => {
  const { t } = useTranslation('frontline');

  return (
    <section className="flex flex-col gap-3">
      <div>
        <h2 className="text-base font-semibold">
          {t('customdomain-dns-title', 'DNS records')}
        </h2>
        <p className="text-sm text-muted-foreground">
          {t(
            'customdomain-dns-description',
            'Add the records below at your DNS provider so {{hostname}} shows the help center at {{target}}.',
            { hostname: domain.hostname, target: domain.cnameTarget },
          )}
        </p>
      </div>

      {!domain.isActive && (
        <Alert>
          <IconInfoCircle />
          <Alert.Description>
            <p>
              {t(
                'customdomain-dns-order',
                'Add all records. The certificate TXT record can only be verified after the CNAME is active, and verification can take up to 24 hours. Statuses are checked every 10 minutes, or press Refresh.',
              )}
            </p>
            <p>
              {t(
                'customdomain-dns-cloudflare',
                'Using Cloudflare? Set the CNAME to "DNS only" (grey cloud).',
              )}
            </p>
          </Alert.Description>
        </Alert>
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

      <CustomDomainRecords records={domain.records} />

      {domain.lastCheckedAt && (
        <p className="text-xs text-muted-foreground">
          {t('customdomain-last-checked', 'Last checked {{date}}', {
            date: new Date(domain.lastCheckedAt).toLocaleString(),
          })}
        </p>
      )}
    </section>
  );
};

const CustomDomainContent = () => {
  const { t } = useTranslation('frontline');
  const { customDomain, loading, error, refetch } = useCustomDomain();

  if (loading && !customDomain) {
    return (
      <div className="flex flex-col gap-3">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-9 w-full max-w-md" />
        <Skeleton className="h-32 w-full" />
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
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            {t('retry', 'Try again')}
          </Button>
        </Alert.Description>
      </Alert>
    );
  }

  if (!customDomain?.isAvailable) {
    return (
      <Empty>
        <Empty.Header>
          <Empty.Title>
            {t('customdomain-unavailable', 'Custom domains are not available')}
          </Empty.Title>
          <Empty.Description>
            {t(
              'customdomain-unavailable-description',
              'Custom help center domains are part of erxes Cloud. On a self-hosted installation, point your domain at the help center in your own reverse proxy.',
            )}
          </Empty.Description>
        </Empty.Header>
      </Empty>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-3">
        <div>
          <h2 className="text-base font-semibold">
            {t('customdomain-title', 'Custom Domain')}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t(
              'customdomain-description',
              'Serve your help center from your own domain. Visitors stay on your domain while seeing the help center at {{target}}.',
              { target: customDomain.cnameTarget },
            )}
          </p>
        </div>
        <CustomDomainForm domain={customDomain} />
      </section>

      {customDomain.hostname && <DnsInstructions domain={customDomain} />}
    </div>
  );
};

export const CustomDomainIndexPage = () => {
  const { t } = useTranslation('frontline');

  return (
    <PageContainer>
      <PageHeader>
        <PageHeader.Start>
          <Breadcrumb>
            <Breadcrumb.List className="gap-1">
              <Breadcrumb.Item>
                <Button variant="ghost" asChild>
                  <Link to="/frontline/customdomain">
                    <IconWorldWww />
                    {t('custom-domain', 'Custom Domain')}
                  </Link>
                </Button>
              </Breadcrumb.Item>
            </Breadcrumb.List>
          </Breadcrumb>
          <Separator.Inline />
          <PageHeader.FavoriteToggleButton
            breadcrumb={createFavoriteBreadcrumb(
              t('custom-domain', 'Custom Domain'),
            )}
            icon="IconWorldWww"
          />
        </PageHeader.Start>
      </PageHeader>

      <div className="flex-auto overflow-y-auto">
        <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6">
          <CustomDomainContent />
        </div>
      </div>
    </PageContainer>
  );
};
