import {
  FACEBOOK_BOT_DETAIL,
  FACEBOOK_BOTS_LIST,
} from '@/integrations/facebook/graphql/queries/facebookBots';
import { resetFacebookAddStateAtom } from '@/integrations/facebook/states/facebookStates';
import {
  ApolloCache,
  ApolloError,
  useMutation,
  useQuery,
} from '@apollo/client';
import { IFacebookBot } from '@/integrations/facebook/types/FacebookBot';
import { toast, useQueryState } from 'erxes-ui';
import { useSetAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import {
  ADD_FACEBOOK_BOT,
  UPDATE_FACEBOOK_BOT,
} from '~/widgets/automations/modules/facebook/components/bots/graphql/automationBotsMutations';
import { facebookBotFormSchema } from '~/widgets/automations/modules/facebook/components/bots/states/facebookBotForm';

export const useFacebookBotSave = (
  // Surfaces that open the form outside the bots settings page hold the bot in
  // their own state rather than in the query string.
  botId?: string | null,
) => {
  const { t } = useTranslation('frontline');
  const [queryBotId] = useQueryState<string>('facebookBotId');
  const facebookBotId = botId ?? queryBotId;
  const resetForm = useSetAtom(resetFacebookAddStateAtom);

  const [addBot, { loading: adding }] = useMutation(ADD_FACEBOOK_BOT);
  const [updateBot, { loading: updating }] = useMutation(UPDATE_FACEBOOK_BOT);

  const writeSavedBot = (cache: ApolloCache<unknown>, savedBot: IFacebookBot) =>
    cache.updateQuery({ query: FACEBOOK_BOTS_LIST }, (current) => {
      if (!current?.facebookMessengerBots) {
        return { facebookMessengerBots: [savedBot] };
      }

      const exists = current.facebookMessengerBots.some(
        (bot) => bot?._id === savedBot._id,
      );

      return {
        facebookMessengerBots: exists
          ? current.facebookMessengerBots.map((bot) =>
              bot?._id === savedBot._id ? savedBot : bot,
            )
          : [savedBot, ...current.facebookMessengerBots],
      };
    });

  const onCompleted = () => {
    toast({
      title: t('save-successful', 'Save successful'),
    });
  };

  const onError = (error: ApolloError) => {
    toast({
      variant: 'destructive',
      title: t('something-went-wrong', 'Uh oh! Something went wrong.'),
      description: error?.message,
    });
  };

  const onSave = (values: z.infer<typeof facebookBotFormSchema>) => {
    if (facebookBotId) {
      updateBot({
        variables: { ...values, _id: facebookBotId },
        update: (cache, { data }) => {
          if (data?.facebookMessengerUpdateBot) {
            writeSavedBot(cache, data.facebookMessengerUpdateBot);
          }
        },
        onCompleted,
        onError,
      });
    } else {
      addBot({
        variables: values,
        update: (cache, { data }) => {
          if (data?.facebookMessengerAddBot) {
            writeSavedBot(cache, data.facebookMessengerAddBot);
          }
        },
        onCompleted,
        onError,
      });
    }

    resetForm();
  };

  return {
    onSaveloading: adding || updating,
    onSave,
  };
};

export const useFacebookBotForm = (facebookBotId: string | null) => {
  const { data, loading: loadingDetail } = useQuery(FACEBOOK_BOT_DETAIL, {
    variables: { _id: facebookBotId },
    skip: !facebookBotId,
  });
  return {
    loadingDetail,
    facebookMessengerBot: data?.facebookMessengerBot ?? undefined,
  };
};
