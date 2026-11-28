import type { AppSubscription, AutomationApp } from '@erxes/core-contract';
import { orpc } from '@erxes/core-contract/client';
import { useQuery } from '@tanstack/react-query';
import { Badge, Tooltip, useFormat } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { QueryState } from '~/components/QueryState';
import { paths } from '~/lib/paths';
import { useCan } from '~/modules/auth/session';
import { catalogQuery } from '~/modules/automations/automationQueries';
import type { Integration } from './catalog';
import { OverviewSection } from './IntegrationLayout';
import { useIntegrationText } from './IntegrationStatusBadge';

const VARIANT = { listening: 'success', syncing: 'secondary', broken: 'destructive' } as const;

const SubscriptionStatus = ({ status }: { status: AppSubscription['status'] }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.triggers' });

  const label = {
    listening: t('listening', 'Listening'),
    syncing: t('syncing', 'Setting up'),
    broken: t('broken', 'Stopped'),
  }[status];

  return <Badge variant={VARIANT[status]}>{label}</Badge>;
};

const SubscriptionRow = ({ subscription }: { subscription: AppSubscription }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.triggers' });
  const fmt = useFormat();
  const { connectionName, status, lastError, lastDeliveryAt, triggers, automations } = subscription;

  return (
    <li className="space-y-1.5 p-3 text-sm">
      <span className="flex flex-wrap items-center gap-2">
        <span className="font-medium">{connectionName}</span>
        <SubscriptionStatus status={status} />
        <span className="ml-auto text-xs text-muted-foreground">
          {lastDeliveryAt
            ? t('last-event', 'Last event {{when}}', { when: fmt.relative(lastDeliveryAt) })
            : t('no-events', 'No events yet')}
        </span>
      </span>
      {triggers.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {triggers.map((trigger) => trigger.label).join(', ')}
        </p>
      )}
      {status === 'broken' && lastError && (
        <p className="text-xs break-words text-destructive-text">{lastError}</p>
      )}
      {automations.length > 0 && (
        <span className="flex flex-wrap gap-x-3 gap-y-1 text-xs">
          {automations.map((automation) => (
            <Link
              key={automation.id}
              to={paths.automations.automation(automation.id)}
              className="text-primary-text hover:underline"
            >
              {automation.name}
            </Link>
          ))}
        </span>
      )}
    </li>
  );
};

const TriggerList = ({ app }: { app: AutomationApp }) => (
  <span className="flex flex-wrap gap-1.5">
    {app.triggers.map((trigger) => (
      <Tooltip key={trigger.key}>
        <Tooltip.Trigger delay={300} render={<span />}>
          <Badge variant="secondary">{trigger.label}</Badge>
        </Tooltip.Trigger>
        <Tooltip.Content>{trigger.description}</Tooltip.Content>
      </Tooltip>
    ))}
  </span>
);

const Listening = ({ integration, app }: { integration: Integration; app: AutomationApp }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.triggers' });
  const { name } = useIntegrationText()(integration);

  const subscriptions = useQuery(
    orpc.integrations.subscriptions.queryOptions({ input: { key: integration.key } }),
  );

  return (
    <OverviewSection title={t('title', 'Automation triggers')}>
      <TriggerList app={app} />
      <QueryState
        query={subscriptions}
        isEmpty={({ data }) => !data.length}
        empty={
          <p className="rounded-lg border p-4 text-sm">
            {t('none', 'None of your automations use {{name}} yet.', { name })}{' '}
            <Link to={paths.automations.list} className="text-primary-text hover:underline">
              {t('open-automations', 'Open automations')}
            </Link>
          </p>
        }
      >
        {({ data }) => (
          <ul className="divide-y rounded-lg border">
            {data.map((subscription) => (
              <SubscriptionRow key={subscription.id} subscription={subscription} />
            ))}
          </ul>
        )}
      </QueryState>
    </OverviewSection>
  );
};

const AppTriggers = ({ integration }: { integration: Integration }) => {
  const catalog = useQuery(catalogQuery());
  const app = catalog.data?.apps.find((item) => item.key === integration.key);

  return app?.triggers.length ? <Listening integration={integration} app={app} /> : null;
};

export const AutomationTriggers = ({ integration }: { integration: Integration }) =>
  useCan()('automations.view') ? <AppTriggers integration={integration} /> : null;
