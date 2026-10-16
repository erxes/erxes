import { INSTAGRAM_BOTS_LIST } from '@/integrations/instagram/graphql/queries/instagramBots';
import { useQuery } from '@apollo/client';
import { isDefined } from 'erxes-ui';

export const useAutomationBotsRecordTable = () => {
  const { data, loading } = useQuery(INSTAGRAM_BOTS_LIST);

  const instagramMessengerBots =
    data?.instagramMessengerBots?.filter(isDefined) ?? [];

  return {
    instagramMessengerBots,
    loading,
  };
};
