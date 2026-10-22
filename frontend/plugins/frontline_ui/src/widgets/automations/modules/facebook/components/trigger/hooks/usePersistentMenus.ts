import { useFacebookBot } from '@/integrations/facebook/hooks/useFacebookBots';
import { hasBotItemId } from '~/widgets/automations/modules/facebook/components/bots/utils/hasBotItemId';

export const usePersistentMenus = (botId: string) => {
  const { bot, loading } = useFacebookBot(botId);

  return {
    loading,
    persistentMenus: (bot?.persistentMenus ?? []).filter(hasBotItemId),
  };
};
