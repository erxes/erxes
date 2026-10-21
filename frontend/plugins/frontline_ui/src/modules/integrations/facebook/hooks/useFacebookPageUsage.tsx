import { useTranslation } from 'react-i18next';
import { useFacebookBots } from '@/integrations/facebook/hooks/useFacebookBots';
import { TFacebookPage } from '@/integrations/facebook/hooks/useFacebookPages';
import { useFbIntegrationContext } from '@/integrations/facebook/contexts/FbIntegrationContext';
import { IntegrationType } from '@/types/Integration';

/** What already holds a page: its integration, channel and bot. */
export const useFacebookPageUsage = (page: TFacebookPage) => {
  const { t } = useTranslation('frontline');
  const { bots } = useFacebookBots();
  const { isPost } = useFbIntegrationContext();
  const { usage } = page;
  const bot = page.id
    ? bots.find(({ pageId }) => pageId === page.id)
    : undefined;

  const channelName =
    usage?.channelName || t('no-channel', { defaultValue: 'No channel' });
  const integrationName = usage?.integrationName || usage?.integrationId || '';

  const summary = usage
    ? `${channelName} › ${integrationName}`
    : t('bot-without-integration', {
        defaultValue: 'Bot attached, no integration',
      });

  // The wizard lists pages of its own kind, so the holder is of that kind too.
  const kind = isPost
    ? IntegrationType.FACEBOOK_POST
    : IntegrationType.FACEBOOK_MESSENGER;
  const manageUrl = usage?.channelId
    ? `/frontline/settings/channels/details/${usage.channelId}/${kind}`
    : undefined;

  return {
    manageUrl,
    hasUsage: Boolean(usage || bot),
    usage,
    bot,
    channelName,
    integrationName,
    summary,
  };
};
