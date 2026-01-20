import { INSTAGRAM_BOTS_LIST } from '@/integrations/instagram/graphql/queries/instagramBots';
import { IInstagramBot } from '@/integrations/instagram/types/InstagramBot';
import { useQuery } from '@apollo/client';

export const useAutomationBotsRecordTable = () => {
  const { data, loading } = useQuery<{ instagramMessengerBots: IInstagramBot[] }>(
    INSTAGRAM_BOTS_LIST,
  );

  const { instagramMessengerBots = [] } = data || {};

  return {
    instagramMessengerBots,
    loading,
  };
};
