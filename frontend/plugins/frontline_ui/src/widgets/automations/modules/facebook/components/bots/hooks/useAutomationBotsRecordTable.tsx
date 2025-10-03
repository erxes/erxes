import { FACEBOOK_BOTS_LIST } from '@/integrations/facebook/graphql/queries/facebookBots';
import { IFacebookBot } from '@/integrations/facebook/types/FacebookBot';
import { useQuery } from '@apollo/client';

export const useAutomationBotsRecordTable = () => {
  const { data, loading } = useQuery<{ facebookMessengerBots: IFacebookBot[] }>(
    FACEBOOK_BOTS_LIST,
  );

  const { facebookMessengerBots = [] } = data || {};

  return {
    facebookMessengerBots,
    loading,
  };
};
