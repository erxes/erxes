import { useFacebookBot } from '@/integrations/facebook/hooks/useFacebookBots';

export const usePersistentMenus = (botId: string) => {
  const { bot, loading } = useFacebookBot(botId);

  return {
    loading,
    persistentMenus: bot?.persistentMenus || [],
  };
};
