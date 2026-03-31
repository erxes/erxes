import {
  IconAlertTriangle,
  IconCircleCheck,
  IconRefresh,
  IconRobot,
  IconSettings,
} from '@tabler/icons-react';
import { Badge, Button, RelativeDateDisplay, cn } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  TFacebookBotHealthStatus,
  useFacebookBotHealthNotification,
} from './useFacebookBotHealthNotification';
import { TNotification } from 'ui-modules';

const statusVariantMap = {
  healthy: 'success',
  degraded: 'destructive',
  broken: 'destructive',
  syncing: 'secondary',
  unknown: 'secondary',
} as const;

export const FacebookBotHealthNotificationContent = ({
  title,
  message,
  metadata,
  createdAt,
}: TNotification) => {
  const { t } = useTranslation();
  const { botId, status, reason, statusView, pageValue, botValue } =
    useFacebookBotHealthNotification({ metadata, t });

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col px-10 py-12">
      <NotificationHeader
        title={title}
        message={message}
        description={statusView.description}
        statusView={statusView}
      />

      <div className="mt-5 flex items-center gap-3">
        <Badge variant={statusVariantMap[status]}>
          {statusView.badgeLabel}
        </Badge>
        <div className="text-sm text-muted-foreground">
          <RelativeDateDisplay value={createdAt}>
            <RelativeDateDisplay.Value value={createdAt} />
          </RelativeDateDisplay>
        </div>
      </div>

      <div className="mt-6 border-t" />

      {reason ? <IssueCard reason={reason} /> : null}

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <DetailItem
          label={t('status', { defaultValue: 'Status' })}
          value={statusView.badgeLabel}
        />
        <DetailItem
          label={t('page', { defaultValue: 'Page' })}
          value={pageValue}
        />
        <DetailItem
          label={t('bot', { defaultValue: 'Bot' })}
          value={botValue}
        />
        <DetailItem
          label={t('updatedAt', { defaultValue: 'Updated' })}
          value={
            <RelativeDateDisplay value={createdAt}>
              <RelativeDateDisplay.Value value={createdAt} />
            </RelativeDateDisplay>
          }
        />
      </div>

      <div className="mt-6 border-t" />

      <div className="mt-6">
        <Button asChild variant="secondary" className="gap-2">
          <Link
            to={
              botId
                ? `/settings/automations/bots/facebook-messenger-bots?facebookBotId=${botId}`
                : '/settings/automations/bots/facebook-messenger-bots'
            }
          >
            <IconSettings className="size-4" />
            {t('openBotSettings', { defaultValue: 'Open bot settings' })}
          </Link>
        </Button>
      </div>
    </div>
  );
};

const NotificationHeader = ({
  title,
  message,
  description,
  statusView,
}: {
  title?: string;
  message: string;
  description: string;
  statusView: ReturnType<typeof buildStatusView>;
}) => {
  return (
    <div className="flex items-start gap-4">
      <div
        className={cn(
          'mt-1 flex size-12 shrink-0 items-center justify-center rounded-2xl',
          statusView.iconContainerClassName,
        )}
      >
        <statusView.icon className={statusView.iconClassName} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
          {title || 'Bot health status'}
        </div>
        <h2 className="mt-1 text-3xl font-semibold tracking-tight text-foreground">
          {message}
        </h2>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  );
};

const IssueCard = ({ reason }: { reason: string }) => {
  const { t } = useTranslation();

  return (
    <div className="mt-6 rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 text-destructive">
          <IconAlertTriangle className="size-4" />
        </div>

        <div className="min-w-0">
          <div className="text-xs font-medium uppercase tracking-wide text-destructive">
            {t('issueDetected', { defaultValue: 'Issue detected' })}
          </div>
          <div className="mt-1 text-sm text-foreground">{reason}</div>
        </div>
      </div>
    </div>
  );
};

const DetailItem = ({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) => {
  return (
    <div>
      <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 break-words text-sm font-medium text-foreground">
        {value}
      </div>
    </div>
  );
};

const buildStatusView = (
  status: TFacebookBotHealthStatus,
  t: ReturnType<typeof useTranslation>['t'],
) => {
  const statusMap = {
    healthy: {
      badgeLabel: t('healthy', { defaultValue: 'Healthy' }),
      description: t('facebookBotHealthyDescription', {
        defaultValue:
          'This bot is connected, subscribed, and ready to handle Facebook Messenger automations.',
      }),
      icon: IconCircleCheck,
      iconClassName: 'size-8 text-success',
      iconContainerClassName: 'bg-success/10 text-success',
    },
    degraded: {
      badgeLabel: t('needsRepair', { defaultValue: 'Needs repair' }),
      description: t('facebookBotDegradedDescription', {
        defaultValue:
          'This bot needs attention before Messenger automations can run reliably again.',
      }),
      icon: IconAlertTriangle,
      iconClassName: 'size-8 text-destructive',
      iconContainerClassName: 'bg-destructive/10 text-destructive',
    },
    broken: {
      badgeLabel: t('broken', { defaultValue: 'Broken' }),
      description: t('facebookBotBrokenDescription', {
        defaultValue:
          'The connection is currently unavailable, so Messenger automations may stop working.',
      }),
      icon: IconAlertTriangle,
      iconClassName: 'size-8 text-destructive',
      iconContainerClassName: 'bg-destructive/10 text-destructive',
    },
    syncing: {
      badgeLabel: t('syncing', { defaultValue: 'Syncing' }),
      description: t('facebookBotSyncingDescription', {
        defaultValue:
          'The bot is being verified and synced with Facebook right now.',
      }),
      icon: IconRefresh,
      iconClassName: 'size-8 text-muted-foreground',
      iconContainerClassName: 'bg-accent text-muted-foreground',
    },
    unknown: {
      badgeLabel: t('unknown', { defaultValue: 'Unknown' }),
      description: t('facebookBotUnknownDescription', {
        defaultValue:
          'We could not determine the latest bot health details from this notification.',
      }),
      icon: IconRobot,
      iconClassName: 'size-8 text-muted-foreground',
      iconContainerClassName: 'bg-accent text-muted-foreground',
    },
  } as const;

  return statusMap[status];
};
