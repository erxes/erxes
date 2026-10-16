import {
  INSTAGRAM_BOTS_LIST,
  GET_INSTAGRAM_BOT_PROFILE,
} from '../graphql/queries/instagramBots';
import { useQuery } from '@apollo/client';
import { isDefined } from 'erxes-ui';

export const useInstagramBots = () => {
  const { data, loading } = useQuery(INSTAGRAM_BOTS_LIST);

  const bots = data?.instagramMessengerBots?.filter(isDefined) ?? [];

  return {
    bots,
    loading,
  };
};

export const useInstagramBot = (botId: string) => {
  const { data, loading } = useQuery(GET_INSTAGRAM_BOT_PROFILE, {
    variables: { _id: botId },
    skip: !botId,
  });

  return {
    bot: data?.instagramMessengerBot ?? undefined,
    loading,
  };
};
