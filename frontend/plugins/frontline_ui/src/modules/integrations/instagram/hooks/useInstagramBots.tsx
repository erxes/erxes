import {
    INSTAGRAM_BOTS_LIST,
    GET_INSTAGRAM_BOT_PROFILE,
  } from '@/integrations/instagram/graphql/queries/instagramBots';
  import { IInstagramBot } from '@/integrations/instagram/types/InstagramBot';
  import { useQuery } from '@apollo/client';
  
  export const useInstagramBots = () => {
    const { data, loading } = useQuery<{ instagramMessengerBots: IInstagramBot[] }>(
      INSTAGRAM_BOTS_LIST,
    );
  
    const { instagramMessengerBots = [] } = data || {};
  
    return {
      bots: instagramMessengerBots,
      loading,
    };
  };
  
  export const useInstagramBot = (botId: string) => {
    const { data, loading } = useQuery<{ instagramMessengerBot: IInstagramBot }>(
      GET_INSTAGRAM_BOT_PROFILE,
      {
        variables: { _id: botId },
        skip: !botId,
      },
    );
  
    const { instagramMessengerBot } = data || {};
  
    return {
      bot: instagramMessengerBot,
      loading,
    };
  };
  