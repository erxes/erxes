import { Button, Label, Skeleton } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import {
  getFacebookBotSheetKey,
  useOpenFacebookBotSheet,
} from '~/widgets/automations/modules/facebook/components/bots/components/FacebookBotSheet';
import { FacebookBotSummary } from '~/widgets/automations/modules/facebook/components/bots/components/FacebookBotSummary';
import { useFacebookIntegrationBot } from '~/widgets/automations/modules/facebook/components/bots/hooks/useFacebookIntegrationBot';

/**
 * The bot row inside an integration dialog. It opens the sheet the matching
 * table row already mounts, so the two surfaces never stack a duplicate.
 */
export const FacebookIntegrationBotSection = ({
  integrationId,
}: {
  integrationId: string;
}) => {
  const { t } = useTranslation('frontline');
  const { loading, page, bot } = useFacebookIntegrationBot(integrationId);
  const openBotSheet = useOpenFacebookBotSheet();

  if (loading) {
    return <Skeleton className="h-8 w-full" />;
  }

  if (!page) {
    return (
      <p className="text-sm text-muted-foreground">
        {t('bot-page-unresolved-description', {
          defaultValue:
            'This integration does not resolve to a single page, so a bot cannot be attached.',
        })}
      </p>
    );
  }

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex min-w-0 flex-col gap-1">
        <Label>{t('bot', { defaultValue: 'Bot' })}</Label>
        <FacebookBotSummary bot={bot} />
      </div>
      <Button
        type="button"
        variant="secondary"
        onClick={() => openBotSheet(getFacebookBotSheetKey(page, bot))}
      >
        {bot
          ? t('configure-bot', { defaultValue: 'Configure bot' })
          : t('create-bot', { defaultValue: 'Create bot' })}
      </Button>
    </div>
  );
};
