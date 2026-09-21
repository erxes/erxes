import { FACEBOOK_BOT_DELIVERY } from '@/integrations/facebook/graphql/queries/facebookBots';
import { useQuery } from '@apollo/client';

export type TFacebookBotDelivery = {
  pending: number;
  sent: number;
  failed: number;
  nextSendAt?: string;
};

/** What the comment outbox is holding for this bot's page. */
export const useFacebookBotDelivery = (botId?: string) => {
  const { data, loading } = useQuery<{
    facebookMessengerBotDelivery: TFacebookBotDelivery;
  }>(FACEBOOK_BOT_DELIVERY, {
    variables: { _id: botId },
    skip: !botId,
    // The queue drains while the sheet is open.
    pollInterval: 30_000,
  });

  return { delivery: data?.facebookMessengerBotDelivery, loading };
};
