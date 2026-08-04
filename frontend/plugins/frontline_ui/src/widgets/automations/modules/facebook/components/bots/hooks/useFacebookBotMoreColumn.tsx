import { useMutation } from '@apollo/client';
import { FACEBOOK_BOTS_LIST } from '@/integrations/facebook/graphql/queries/facebookBots';
import { IFacebookBot } from '@/integrations/facebook/types/FacebookBot';
import { toast, useQueryState } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import {
  REMOVE_FACEBOOK_BOT,
  REPAIR_FACEBOOK_BOT,
} from '~/widgets/automations/modules/facebook/components/bots/graphql/automationBotsMutations';

export const useFacebookBotMoreColumn = (_id: string) => {
  const { t } = useTranslation('frontline');
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
      onCompleted: () => toast({ title: t('repaired-successfully') }),
      onError: (error) =>
        toast({
          title: t('something-went-wrong'),
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
      onCompleted: () => toast({ title: t('removed-successfully') }),
      onError: (error) =>
        toast({
          title: t('something-went-wrong'),
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
