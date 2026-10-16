import { FACEBOOK_BOT_DELIVERY } from '@/integrations/facebook/graphql/queries/facebookBots';
import { useQuery } from '@apollo/client';
import type { FacebookMessengerBotDeliveryQuery } from '~/gql/graphql';

export type TFacebookBotDelivery = NonNullable<
  FacebookMessengerBotDeliveryQuery['facebookMessengerBotDelivery']
>;

/** What the comment outbox is holding for this bot's page. */
export const useFacebookBotDelivery = (botId?: string) => {
  const { data, loading } = useQuery(FACEBOOK_BOT_DELIVERY, {
    variables: botId ? { _id: botId } : undefined,
    skip: !botId,
    // The queue drains while the sheet is open.
    pollInterval: 30_000,
  });

  return { delivery: data?.facebookMessengerBotDelivery, loading };
};
