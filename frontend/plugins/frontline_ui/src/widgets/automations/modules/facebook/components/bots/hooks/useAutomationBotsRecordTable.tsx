import { FACEBOOK_BOTS_LIST } from '@/integrations/facebook/graphql/queries/facebookBots';
import { useQuery } from '@apollo/client';
import { isDefined } from 'erxes-ui';

export const useAutomationBotsRecordTable = () => {
  const { data, loading } = useQuery(FACEBOOK_BOTS_LIST);

  const facebookMessengerBots =
    data?.facebookMessengerBots?.filter(isDefined) ?? [];

  return {
    facebookMessengerBots,
    loading,
  };
};
