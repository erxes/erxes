import {
  FACEBOOK_BOTS_LIST,
  GET_FACEBOOK_BOT_PROFILE,
} from '@/integrations/facebook/graphql/queries/facebookBots';
import { useQuery } from '@apollo/client';
import { isDefined } from 'erxes-ui';

export const useFacebookBots = () => {
  const { data, loading } = useQuery(FACEBOOK_BOTS_LIST);

  const bots = data?.facebookMessengerBots?.filter(isDefined) ?? [];

  return {
    bots,
    loading,
  };
};

export const useFacebookBot = (botId: string) => {
  const { data, loading } = useQuery(GET_FACEBOOK_BOT_PROFILE, {
    variables: { _id: botId },
    skip: !botId,
  });

  return {
    bot: data?.facebookMessengerBot ?? undefined,
    loading,
  };
};
