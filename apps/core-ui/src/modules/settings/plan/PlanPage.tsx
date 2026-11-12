import type { SubscriptionInfo } from '@erxes/core-contract';
import { IconApps, IconCreditCard, IconExternalLink } from '@tabler/icons-react';
import {
  Badge,
  Button,
  Empty,
  PageContainer,
  RelativeDateDisplay,
  ScrollArea,
  Spinner,
  PageHeader,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { AppBreadcrumb } from '~/components/AppBreadcrumb';
import { messageOf } from '~/lib/api';
import { usePlan } from '~/modules/saas/usePlan';

type Row = SubscriptionInfo['plugins'][number];

const TIER = { free: 'secondary', plus: 'info', pro: 'success' } as const;

const ACCESS = {
  full: 'success',
  warning: 'warning',
  read_only: 'destructive',
  off: 'secondary',
} as const;

const day = (value: string) =>
  new Date(value).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });

const PluginRow = ({ plugin }: { plugin: Row }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'plan' });

  return (
    <li className="flex flex-wrap items-center gap-3 p-3 text-sm">
      <span className="font-medium">{plugin.title}</span>
      {plugin.tier && (
        <Badge variant={TIER[plugin.tier]}>{t(`tier.${plugin.tier}`, plugin.tier)}</Badge>
      )}
      {plugin.access !== 'full' && (
        <Badge variant={ACCESS[plugin.access]}>{t(`access.${plugin.access}`, plugin.access)}</Badge>
      )}
      {plugin.status === 'past_due' && (
        <span className="text-xs text-warning">{t('past-due', 'payment retrying')}</span>
      )}
      {plugin.status === 'canceling' && (
        <span className="text-xs text-muted-foreground">
          {t('canceling', 'ends at the end of the period')}
        </span>
      )}
      {plugin.readOnlyUntil && (
        <span className="text-xs text-destructive">
          {t('read-only-until', 'read-only until {{date}}, then off', {
            date: day(plugin.readOnlyUntil),
          })}
        </span>
      )}
      {!plugin.installed && plugin.access !== 'off' && plugin.access !== 'read_only' && (
        <span className="ml-auto text-xs text-muted-foreground">
          {t('not-installed', 'not installed')}
        </span>
      )}
    </li>
  );
};

const SelfHosted = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'plan' });

  return (
    <Empty className="py-16">
      <Empty.Header>
        <Empty.Media variant="icon">
          <IconCreditCard />
        </Empty.Media>
        <Empty.Title>{t('self-hosted', 'No plan: this installation is self-hosted')}</Empty.Title>
        <Empty.Description>
          {t('self-hosted-description', 'Every plugin and feature is available.')}
        </Empty.Description>
      </Empty.Header>
    </Empty>
  );
};

/** The workspace's status on erxes.io and each plugin's row. */
const SaasPlan = ({ plan }: { plan: SubscriptionInfo }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'plan' });

  return (
    <>
      <p className="text-sm text-muted-foreground">
        {t(
          'intro',
          'Plugins are bought on erxes.io, one subscription for the workspace: each plugin at Free, Plus or Pro, alone or in a bundle.',
        )}
      </p>
      {plan.organizationStatus !== 'active' && (
        <p className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
          {t('disabled', 'This workspace is disabled on erxes.io ({{status}}).', {
            status: plan.organizationStatus,
          })}
        </p>
      )}
      <section className="space-y-2">
        <h3 className="flex items-center gap-2 text-sm font-medium">
          <IconApps className="size-4" />
          {t('plugins', 'Plugins')}
        </h3>
        {plan.plugins.length ? (
          <ul className="divide-y rounded-lg border">
            {plan.plugins.map((plugin) => (
              <PluginRow key={plugin.code} plugin={plugin} />
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">
            {t('no-plugins', 'No plugins yet: add them on erxes.io.')}
          </p>
        )}
      </section>
      {plan.checkedAt && (
        <p className="text-xs text-muted-foreground">
          {t('checked', 'Checked with erxes.io')}{' '}
          <RelativeDateDisplay value={plan.checkedAt} asChild>
            <span>
              <RelativeDateDisplay.Value value={plan.checkedAt} />
            </span>
          </RelativeDateDisplay>
        </p>
      )}
    </>
  );
};

/** Settings › Plan (SaaS): what this workspace has on erxes.io — each plugin's tier, payment status and access. */
export const PlanPage = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'plan' });
  const { data, isLoading, error } = usePlan();

  return (
    <PageContainer>
      <PageHeader>
        <PageHeader.Start>
          <AppBreadcrumb
            items={[{ label: t('title', 'Plan'), to: '/settings/plan', icon: IconCreditCard }]}
          />
        </PageHeader.Start>
        {data?.manageUrl && (
          <PageHeader.End>
            <Button asChild>
              <a href={data.manageUrl} target="_blank" rel="noreferrer">
                <IconExternalLink />
                {t('manage', 'Manage on erxes.io')}
              </a>
            </Button>
          </PageHeader.End>
        )}
      </PageHeader>
      <ScrollArea className="flex-1">
        <div className="mx-auto max-w-3xl space-y-6 p-6">
          {error ? (
            <p className="py-12 text-center text-sm text-destructive">{messageOf(error)}</p>
          ) : isLoading ? (
            <Spinner containerClassName="py-12" />
          ) : !data?.saas ? (
            <SelfHosted />
          ) : (
            <SaasPlan plan={data} />
          )}
        </div>
      </ScrollArea>
    </PageContainer>
  );
};
