import { IconAlertTriangle, IconSettings } from '@tabler/icons-react';
import { Badge, Button, RelativeDateDisplay, cn } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  TFacebookBotHealthStatusView,
  useFacebookBotHealthNotification,
} from './useFacebookBotHealthNotification';
import { TNotification } from 'ui-modules';

export const FacebookBotHealthNotificationContent = ({
  title,
  message,
  metadata,
  createdAt,
}: TNotification) => {
  const { t } = useTranslation();
  const { botId, reason, statusView, statusVariant, pageValue, botValue } =
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
        <Badge variant={statusVariant}>{statusView.badgeLabel}</Badge>
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
  statusView: TFacebookBotHealthStatusView;
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
        <h2 className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
          {title || 'Bot health status'}
        </h2>
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
