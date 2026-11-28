import type { LicenseStatus } from '@erxes/core-contract';
import { messageOf, orpc } from '@erxes/core-contract/client';
import { IconCertificate, IconRefresh } from '@tabler/icons-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  AppBreadcrumb,
  Badge,
  Button,
  Empty,
  PageContainer,
  PageHeader,
  RelativeDateDisplay,
  ScrollArea,
  Spinner,
  useFormat,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { paths } from '~/lib/paths';
import { useMinuteClock } from '~/lib/useMinuteClock';
import { useCan } from '~/modules/auth/session';
import { DAY, useLicense } from '~/modules/license/useLicense';

const ACCESS = {
  full: 'success',
  warning: 'warning',
  read_only: 'destructive',
  off: 'secondary',
} as const;

/** Where the license stands: running, its last day near, read-only after it, or over. */
const Standing = ({ license }: { license: NonNullable<LicenseStatus['license']> }) => {
  const { t } = useTranslation('workspace', { keyPrefix: 'license' });
  const fmt = useFormat();
  const now = useMinuteClock();
  const until = Date.parse(license.until);
  const graceEnds = until + license.graceDays * DAY;

  if (now < until) {
    return (
      <span>
        {t('through', 'Through {{date}}, {{count}} days left', {
          date: fmt.date(license.until),
          // Whole days after today: a license runs through the end of its last day.
          count: Math.floor((until - now) / DAY),
        })}
      </span>
    );
  }

  return (
    <span className="text-destructive-text">
      {now < graceEnds
        ? t('grace', 'Ended {{date}}: its plugins only read until {{end}}, then stop.', {
            date: fmt.date(license.until),
            end: fmt.date(new Date(graceEnds).toISOString()),
          })
        : t('over', 'Ended {{date}}: its plugins have stopped.', { date: fmt.date(license.until) })}
    </span>
  );
};

/** With an activation key: when core last asked erxes.io, why that failed, and asking again. */
const Activation = ({ status }: { status: LicenseStatus }) => {
  const { t } = useTranslation('workspace', { keyPrefix: 'license' });
  const can = useCan();
  const client = useQueryClient();

  const refresh = useMutation(
    orpc.license.refresh.mutationOptions({
      onSuccess: (fresh) => client.setQueryData(orpc.license.status.queryKey(), fresh),
    }),
  );

  return (
    <section className="space-y-2 text-sm">
      <div className="flex flex-wrap items-center gap-2 text-muted-foreground">
        {status.checkedAt ? (
          <span>
            {t('checked', 'Fetched from erxes.io')}{' '}
            <RelativeDateDisplay value={status.checkedAt} render={<span />}>
              <RelativeDateDisplay.Value value={status.checkedAt} />
            </RelativeDateDisplay>
          </span>
        ) : (
          <span>{t('not-checked', 'Not fetched from erxes.io yet')}</span>
        )}
        {can('plugins.manage') && (
          <Button
            variant="outline"
            size="sm"
            disabled={refresh.isPending}
            onClick={() => refresh.mutate({})}
          >
            <IconRefresh />
            {t('check-now', 'Check now')}
          </Button>
        )}
      </div>
      {status.checkError && (
        <p className="text-destructive-text">
          {t('check-error', 'The last fetch failed, so the license above stays: {{error}}', {
            error: status.checkError,
          })}
        </p>
      )}
      {refresh.error && <p className="text-destructive-text">{messageOf(refresh.error)}</p>}
    </section>
  );
};

const NoLicense = () => {
  const { t } = useTranslation('workspace', { keyPrefix: 'license' });

  return (
    <Empty>
      <Empty.Header>
        <Empty.Media variant="icon">
          <IconCertificate />
        </Empty.Media>
        <Empty.Title>{t('none', 'No erxes license')}</Empty.Title>
        <Empty.Description>
          {t(
            'none-description',
            "Register this server on erxes.io › Self-hosted and set its activation key as ERXES_ACTIVATION_KEY in core's .env, then restart core. A server without internet sets the license itself as ERXES_LICENSE.",
          )}
        </Empty.Description>
      </Empty.Header>
    </Empty>
  );
};

const License = ({ status }: { status: LicenseStatus }) => {
  const { t } = useTranslation('workspace', { keyPrefix: 'license' });

  return (
    <>
      {status.license ? (
        <section className="space-y-3 rounded-lg border p-4 text-sm">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <span className="text-base font-medium">{status.license.customer}</span>
            <Standing license={status.license} />
          </div>
          <div className="flex flex-wrap gap-1">
            {status.license.plugins.map((plugin) => (
              <Badge key={plugin} variant="secondary">
                {plugin}
              </Badge>
            ))}
          </div>
          <p className="text-muted-foreground">
            {status.source === 'file'
              ? t('from-file', 'Given by hand as ERXES_LICENSE.')
              : t(
                  'from-activation',
                  "Fetched every day from erxes.io with this server's activation key.",
                )}
          </p>
        </section>
      ) : (
        <NoLicense />
      )}
      {status.source === 'activation' && <Activation status={status} />}
      <section className="space-y-2">
        <h2 className="text-sm font-medium">{t('plugins', 'Plugins that need it')}</h2>
        {status.plugins.length ? (
          <ul className="divide-y rounded-lg border">
            {status.plugins.map((plugin) => (
              <li key={plugin.name} className="flex items-center gap-3 p-3 text-sm">
                <span className="flex-1 font-medium">{plugin.title}</span>
                <Badge variant={ACCESS[plugin.access]}>
                  {t(`access.${plugin.access}`, plugin.access)}
                </Badge>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">
            {t('no-plugins', 'No plugin installed here needs an erxes license.')}
          </p>
        )}
      </section>
    </>
  );
};

/** Settings › License (self-hosted): the server's erxes license, where it comes from, what it covers. */
export const LicensePage = () => {
  const { t } = useTranslation('workspace', { keyPrefix: 'license' });
  const { data, isLoading, error } = useLicense();

  return (
    <PageContainer>
      <PageHeader>
        <PageHeader.Start>
          <AppBreadcrumb
            items={[
              { label: t('title', 'License'), to: paths.settings.license, icon: IconCertificate },
            ]}
          />
        </PageHeader.Start>
      </PageHeader>
      <ScrollArea className="flex-1">
        <div className="mx-auto max-w-3xl space-y-6 p-6">
          {error ? (
            <p className="py-12 text-center text-sm text-destructive-text">{messageOf(error)}</p>
          ) : isLoading || !data ? (
            <Spinner area="lg" />
          ) : data.saas ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              {t(
                'saas',
                'On erxes.io your plan decides what each plugin may do: see Settings › Plan.',
              )}
            </p>
          ) : (
            <License status={data} />
          )}
        </div>
      </ScrollArea>
    </PageContainer>
  );
};
