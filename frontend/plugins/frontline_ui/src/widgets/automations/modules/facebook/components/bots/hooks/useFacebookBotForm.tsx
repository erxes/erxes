import {
  FACEBOOK_BOT_DETAIL,
  FACEBOOK_BOTS_LIST,
} from '@/integrations/facebook/graphql/queries/facebookBots';
import { IFacebookBot } from '@/integrations/facebook/types/FacebookBot';
import { resetFacebookAddStateAtom } from '@/integrations/facebook/states/facebookStates';
import { useMutation, useQuery } from '@apollo/client';
import { toast, useQueryState } from 'erxes-ui';
import { useSetAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import {
  ADD_FACEBOOK_BOT,
  UPDATE_FACEBOOK_BOT,
} from '~/widgets/automations/modules/facebook/components/bots/graphql/automationBotsMutations';
import { facebookBotFormSchema } from '~/widgets/automations/modules/facebook/components/bots/states/facebookBotForm';
import { FacebookBotDetailQueryResponse } from '~/widgets/automations/modules/facebook/components/bots/types/facebookBotTypes';

export const useFacebookBotSave = (
  // Surfaces that open the form outside the bots settings page hold the bot in
  // their own state rather than in the query string.
  botId?: string | null,
) => {
  const { t } = useTranslation('frontline');
  const [queryBotId] = useQueryState<string>('facebookBotId');
  const facebookBotId = botId ?? queryBotId;
  const resetForm = useSetAtom(resetFacebookAddStateAtom);

  const [save, { loading: onSaveloading }] = useMutation(
    facebookBotId ? UPDATE_FACEBOOK_BOT : ADD_FACEBOOK_BOT,
  );

  const onSave = (values: z.infer<typeof facebookBotFormSchema>) => {
    const variables = {
      ...values,
      _id: facebookBotId || undefined,
    };
    save({
      variables,
      update: (cache, { data }) => {
        const savedBot = facebookBotId
          ? data?.facebookMessengerUpdateBot
          : data?.facebookMessengerAddBot;

        if (!savedBot) {
          return;
        }

        cache.updateQuery<{ facebookMessengerBots: IFacebookBot[] }>(
          {
            query: FACEBOOK_BOTS_LIST,
          },
          (current) => {
            if (!current?.facebookMessengerBots) {
              return { facebookMessengerBots: [savedBot] };
            }

            const exists = current.facebookMessengerBots.some(
              (bot) => bot._id === savedBot._id,
            );

            return {
              facebookMessengerBots: exists
                ? current.facebookMessengerBots.map((bot) =>
                    bot._id === savedBot._id ? savedBot : bot,
                  )
                : [savedBot, ...current.facebookMessengerBots],
            };
          },
        );
      },
      onCompleted: () => {
        toast({
          title: t('save-successful', 'Save successful'),
        });
      },
      onError: (error) => {
        toast({
          variant: 'destructive',
          title: t('something-went-wrong', 'Uh oh! Something went wrong.'),
          description: error?.message,
        });
      },
    });

    resetForm();
  };

  return {
    onSaveloading,
    onSave,
  };
};

export const useFacebookBotForm = (facebookBotId: string | null) => {
  const { data, loading: loadingDetail } =
    useQuery<FacebookBotDetailQueryResponse>(FACEBOOK_BOT_DETAIL, {
      variables: { _id: facebookBotId },
      skip: !facebookBotId,
    });
  const { facebookMessengerBot } = data || {};

  return {
    loadingDetail,
    facebookMessengerBot,
  };
};
