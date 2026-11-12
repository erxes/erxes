import { IconApps, IconCreditCard, IconExternalLink, IconUsersGroup } from '@tabler/icons-react';
import { Badge, Button, cn, Empty, PageContainer, ScrollArea, Spinner } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { PageHeader } from 'ui-modules';
import { AppBreadcrumb } from '~/components/AppBreadcrumb';
import { usePlan } from '~/modules/saas/usePlan';

const STANDING = { ok: 'success', warning: 'warning', read_only: 'destructive', suspended: 'destructive' } as const;
const day = (value: string) => new Date(value).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });
const LIMIT_LABELS: Record<string, string> = { teamMembers: 'Team members' };

/** Settings › Plan (SaaS): the subscription, its standing, included plugins and limits with usage. */
export const PlanPage = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'plan' });
  const { data, isLoading } = usePlan();

  return (
    <PageContainer>
      <PageHeader>
        <PageHeader.Start>
          <AppBreadcrumb items={[{ label: t('title', 'Plan'), to: '/settings/plan', icon: IconCreditCard }]} />
        </PageHeader.Start>
        {data?.manageUrl && (
          <PageHeader.End>
            <Button asChild>
              <a href={data.manageUrl} target="_blank" rel="noreferrer">
                <IconExternalLink />
                {t('manage', 'Manage subscription')}
              </a>
            </Button>
          </PageHeader.End>
        )}
      </PageHeader>
      <ScrollArea className="flex-1">
        <div className="mx-auto max-w-3xl space-y-6 p-6">
          {isLoading ? (
            <Spinner containerClassName="py-12" />
          ) : !data?.saas || !data.plan ? (
            <Empty className="py-16">
              <Empty.Header>
                <Empty.Media variant="icon">
                  <IconCreditCard />
                </Empty.Media>
                <Empty.Title>{t('self-hosted', 'No plan: this installation is self-hosted')}</Empty.Title>
                <Empty.Description>{t('self-hosted-description', 'Every plugin and feature is available, without limits.')}</Empty.Description>
              </Empty.Header>
            </Empty>
          ) : (
            <>
              <section className="space-y-3 rounded-lg border p-5">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-semibold">{data.planName ?? data.plan}</h2>
                  <Badge variant={STANDING[data.standing]}>{t(`standing.${data.standing}`, data.standing)}</Badge>
                  {data.status && <span className="text-sm text-muted-foreground">{t(`status.${data.status}`, data.status)}</span>}
                </div>
                <dl className="grid grid-cols-2 gap-y-1 text-sm">
                  {data.currentPeriodEnd && (
                    <>
                      <dt className="text-muted-foreground">{data.status === 'active' || data.status === 'trialing' ? t('renews', 'Renews') : t('ended', 'Period ends')}</dt>
                      <dd>{day(data.currentPeriodEnd)}</dd>
                    </>
                  )}
                  {data.readOnlyAt && (
                    <>
                      <dt className="text-muted-foreground">{t('read-only-at', 'Read-only from')}</dt>
                      <dd className={cn(data.standing === 'read_only' && 'text-destructive')}>{day(data.readOnlyAt)}</dd>
                    </>
                  )}
                  {data.suspendedReason && (
                    <>
                      <dt className="text-muted-foreground">{t('suspended', 'Suspended')}</dt>
                      <dd className="text-destructive">{data.suspendedReason}</dd>
                    </>
                  )}
                </dl>
              </section>
              {data.limits.length > 0 && (
                <section className="space-y-2">
                  <h3 className="flex items-center gap-2 text-sm font-medium">
                    <IconUsersGroup className="size-4" />
                    {t('limits', 'Limits')}
                  </h3>
                  <ul className="divide-y rounded-lg border">
                    {data.limits.map((limit) => {
                      const ratio = limit.limit && limit.used !== null ? Math.min(1, limit.used / limit.limit) : null;

                      return (
                        <li key={limit.key} className="space-y-1.5 p-3 text-sm">
                          <div className="flex items-center">
                            <span>{t(`limit.${limit.key}`, LIMIT_LABELS[limit.key] ?? limit.key)}</span>
                            <span className="ml-auto text-muted-foreground">
                              {limit.used !== null ? `${limit.used} / ` : ''}
                              {limit.limit ?? t('unlimited', 'unlimited')}
                            </span>
                          </div>
                          {ratio !== null && (
                            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                              <div className={cn('h-full rounded-full', ratio >= 1 ? 'bg-destructive' : ratio > 0.8 ? 'bg-warning' : 'bg-primary')} style={{ width: `${ratio * 100}%` }} />
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </section>
              )}
              <section className="space-y-2">
                <h3 className="flex items-center gap-2 text-sm font-medium">
                  <IconApps className="size-4" />
                  {t('plugins', 'Included plugins')}
                </h3>
                {data.plugins.length ? (
                  <ul className="divide-y rounded-lg border">
                    {data.plugins.map((plugin) => (
                      <li key={plugin.name} className="flex items-center gap-3 p-3 text-sm">
                        <span className="font-medium">{plugin.title}</span>
                        {!plugin.installed && <Badge variant="secondary">{t('not-installed', 'not installed')}</Badge>}
                        {plugin.until && <span className="ml-auto text-xs text-muted-foreground">{t('until', 'until {{date}}', { date: day(plugin.until) })}</span>}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">{t('no-plugins', 'Your plan has no plugins yet.')}</p>
                )}
              </section>
            </>
          )}
        </div>
      </ScrollArea>
    </PageContainer>
  );
};
