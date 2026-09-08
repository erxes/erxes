import { IFacebookBot } from '@/integrations/facebook/types/FacebookBot';
import { IconAlertTriangle } from '@tabler/icons-react';
import { Badge, Label, Skeleton } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useFacebookBotDelivery } from '~/widgets/automations/modules/facebook/components/bots/hooks/useFacebookBotDelivery';
import { useFacebookBotHealthCell } from '~/widgets/automations/modules/facebook/components/bots/hooks/useFacebookBotHealthCell';

/** Everything that decides whether this bot's replies are going out. */
export const FacebookBotHealthPanel = ({ bot }: { bot?: IFacebookBot }) => {
  const { t } = useTranslation('frontline');
  const { statusLabel, statusVariant } = useFacebookBotHealthCell(bot?.health);
  const { delivery, loading } = useFacebookBotDelivery(bot?._id);

  if (!bot?._id) {
    return null;
  }

  const blockedUntil = bot.health?.sendBlockedUntil;
  const isBlocked =
    Boolean(blockedUntil) && new Date(blockedUntil as string) > new Date();

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Label>{t('bot-health', { defaultValue: 'Bot health' })}</Label>
        <Badge variant={statusVariant}>{statusLabel}</Badge>
      </div>

      {bot.health?.lastError && (
        <p className="text-xs text-muted-foreground">{bot.health.lastError}</p>
      )}

      {isBlocked && (
        <p className="flex items-start gap-1.5 text-xs text-warning">
          <IconAlertTriangle className="mt-0.5 size-3.5 shrink-0" />
          {t('public-replies-paused-until', {
            defaultValue:
              'Facebook refused a public reply, so they are paused until {{until}}. Private replies are unaffected.',
            until: new Date(blockedUntil as string).toLocaleString(),
          })}
        </p>
      )}

      {loading && <Skeleton className="h-8 w-full" />}

      {!loading && delivery && (
        <div className="flex flex-col gap-1 rounded-md border px-3 py-2">
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <DeliveryCount
              label={t('queued', { defaultValue: 'Queued' })}
              value={delivery.pending}
            />
            <DeliveryCount
              label={t('sent', { defaultValue: 'Sent' })}
              value={delivery.sent}
            />
            <DeliveryCount
              label={t('failed', { defaultValue: 'Failed' })}
              value={delivery.failed}
            />
          </div>
          {delivery.nextSendAt && delivery.pending > 0 && (
            <span className="text-xs text-muted-foreground">
              {t('next-public-reply-at', {
                defaultValue: 'Next public reply at {{at}}',
                at: new Date(delivery.nextSendAt).toLocaleTimeString(),
              })}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

const DeliveryCount = ({ label, value }: { label: string; value: number }) => (
  <span className="flex items-center gap-1.5">
    <span className="text-muted-foreground">{label}</span>
    <span className="font-semibold">{value}</span>
  </span>
);
