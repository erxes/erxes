import { IFacebookBot } from '@/integrations/facebook/types/FacebookBot';
import { Avatar, Badge } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useFacebookBotHealthCell } from '~/widgets/automations/modules/facebook/components/bots/hooks/useFacebookBotHealthCell';

export const FacebookBotSummary = ({ bot }: { bot?: IFacebookBot }) => {
  const { t } = useTranslation('frontline');
  const { statusLabel, statusVariant } = useFacebookBotHealthCell(bot?.health);

  if (!bot) {
    return (
      <span className="text-muted-foreground">
        {t('no-bot-connected', { defaultValue: 'No bot connected' })}
      </span>
    );
  }

  return (
    <div className="flex min-w-0 items-center gap-2">
      <Avatar className="size-5">
        <Avatar.Image src={bot.profileUrl || '/images/erxes-bot.svg'} />
        <Avatar.Fallback>{(bot.name || '').charAt(0)}</Avatar.Fallback>
      </Avatar>
      <span className="truncate">{bot.name}</span>
      <Badge variant={statusVariant}>{statusLabel}</Badge>
    </div>
  );
};
