import { IFacebookBot } from '@/integrations/facebook/types/FacebookBot';
import { Badge, Label } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useFacebookBotHealthCell } from '~/widgets/automations/modules/facebook/components/bots/hooks/useFacebookBotHealthCell';

/** Whether Facebook is still accepting this bot's Messenger profile. */
export const FacebookBotProfileHealth = ({ bot }: { bot?: IFacebookBot }) => {
  const { t } = useTranslation('frontline');
  const { statusLabel, statusVariant } = useFacebookBotHealthCell(bot?.health);

  if (!bot?._id) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Label>
          {t('messenger-profile', { defaultValue: 'Messenger profile' })}
        </Label>
        <Badge variant={statusVariant}>{statusLabel}</Badge>
      </div>
      <p className="text-xs text-muted-foreground">
        {t('messenger-profile-description', {
          defaultValue:
            'Covers the menu, greeting and ice breakers Facebook holds for this page.',
        })}
      </p>
      {bot.health?.lastError && (
        <p className="text-xs text-destructive">{bot.health.lastError}</p>
      )}
      {bot.health?.lastVerifiedAt && (
        <p className="text-xs text-muted-foreground">
          {t('last-verified-at', {
            defaultValue: 'Last verified {{at}}',
            at: new Date(bot.health.lastVerifiedAt).toLocaleString(),
          })}
        </p>
      )}
    </div>
  );
};
