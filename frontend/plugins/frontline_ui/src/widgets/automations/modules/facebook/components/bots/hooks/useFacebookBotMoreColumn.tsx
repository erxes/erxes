import { useMutation } from '@apollo/client';
import { FACEBOOK_BOTS_LIST } from '@/integrations/facebook/graphql/queries/facebookBots';
import { IFacebookBot } from '@/integrations/facebook/types/FacebookBot';
import { toast, useQueryState } from 'erxes-ui';
import {
  REMOVE_FACEBOOK_BOT,
  REPAIR_FACEBOOK_BOT,
} from '~/widgets/automations/modules/facebook/components/bots/graphql/automationBotsMutations';

export const useFacebookBotMoreColumn = (_id: string) => {
  const [, setFacebookBotId] = useQueryState('facebookBotId');

  const [repairBot, { loading: loadingRepair }] = useMutation(
    REPAIR_FACEBOOK_BOT,
    {
      variables: { _id },
      update: (cache) => {
        cache.updateQuery<{ facebookMessengerBots: IFacebookBot[] }>(
          {
            query: FACEBOOK_BOTS_LIST,
          },
          (data) => {
            if (!data?.facebookMessengerBots) {
              return data;
            }

            return {
              facebookMessengerBots: data.facebookMessengerBots.map((bot) =>
                bot._id === _id
                  ? {
                      ...bot,
                      health: {
                        ...bot.health,
                        status: 'syncing',
                        lastError: '',
                      },
                    }
                  : bot,
              ),
            };
          },
        );
      },
      onCompleted: () => toast({ title: 'Repaired successfully' }),
      onError: (error) =>
        toast({
          title: 'Something went wrong',
          description: error.message,
          variant: 'destructive',
        }),
    },
  );

  const [removeBot, { loading: loadingRemove }] = useMutation(
    REMOVE_FACEBOOK_BOT,
    {
      variables: { _id },
      update: (cache) => {
        cache.updateQuery<{ facebookMessengerBots: IFacebookBot[] }>(
          {
            query: FACEBOOK_BOTS_LIST,
          },
          (data) => {
            if (!data?.facebookMessengerBots) {
              return data;
            }

            return {
              facebookMessengerBots: data.facebookMessengerBots.filter(
                (bot) => bot._id !== _id,
              ),
            };
          },
        );
      },
      onCompleted: () => toast({ title: 'Removed successfully' }),
      onError: (error) =>
        toast({
          title: 'Something went wrong',
          description: error.message,
          variant: 'destructive',
        }),
    },
  );

  return {
    loadingRepair,
    loadingRemove,
    handleEdit: () => setFacebookBotId(_id),
    handleRepair: () => repairBot(),
    handleRemove: () => removeBot(),
  };
};
