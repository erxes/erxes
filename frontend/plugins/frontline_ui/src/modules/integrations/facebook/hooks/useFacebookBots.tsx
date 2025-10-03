import {
  FACEBOOK_BOTS_LIST,
  GET_FACEBOOK_BOT_PROFILE,
} from '@/integrations/facebook/graphql/queries/facebookBots';
import { IFacebookBot } from '@/integrations/facebook/types/FacebookBot';
import { useQuery } from '@apollo/client';

export const useFacebookBots = () => {
  const { data, loading } = useQuery<{ facebookMessengerBots: IFacebookBot[] }>(
    FACEBOOK_BOTS_LIST,
  );

  const { facebookMessengerBots = [] } = data || {};

  return {
    bots: facebookMessengerBots,
    loading,
  };
};

export const useFacebookBot = (botId: string) => {
  const { data, loading } = useQuery<{ facebookMessengerBot: IFacebookBot }>(
    GET_FACEBOOK_BOT_PROFILE,
    {
      variables: { _id: botId },
      skip: !botId,
    },
  );

  const { facebookMessengerBot } = data || {};

  return {
    bot: facebookMessengerBot,
    loading,
  };
};
