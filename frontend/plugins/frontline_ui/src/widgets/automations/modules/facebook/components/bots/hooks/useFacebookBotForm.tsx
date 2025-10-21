import { FACEBOOK_BOT_DETAIL } from '@/integrations/facebook/graphql/queries/facebookBots';
import {
  resetFacebookAddStateAtom,
  selectedFacebookAccountAtom,
  selectedFacebookPageAtom,
} from '@/integrations/facebook/states/facebookStates';
import { useMutation, useQuery } from '@apollo/client';
import { toast, useQueryState } from 'erxes-ui';
import { useAtomValue, useSetAtom } from 'jotai';
import { generateAutomationElementId } from 'ui-modules';
import { z } from 'zod';
import {
  ADD_FACEBOOK_BOT,
  UPDATE_FACEBOOK_BOT,
} from '~/widgets/automations/modules/facebook/components/bots/graphql/automationBotsMutations';
import { facebookBotFormSchema } from '~/widgets/automations/modules/facebook/components/bots/states/facebookBotForm';
import { FacebookBotDetailQueryResponse } from '~/widgets/automations/modules/facebook/components/bots/types/facebookBotTypes';

export const useFacebookBotSave = () => {
  const [facebookBotId] = useQueryState<string>('facebookBotId');
  const resetForm = useSetAtom(resetFacebookAddStateAtom);

  const [save, { loading: onSaveloading }] = useMutation(
    facebookBotId ? UPDATE_FACEBOOK_BOT : ADD_FACEBOOK_BOT,
  );

  const onSave = (values: z.infer<typeof facebookBotFormSchema>) => {
    save({ variables: values })
      .then(() => {
        toast({
          title: 'Save successful',
        });
      })
      .catch((error) =>
        toast({
          variant: 'destructive',
          title: 'Something went wrong',
          description: error?.message,
        }),
      );

    resetForm();
  };

  return {
    onSaveloading,
    onSave,
  };
};

/**
 * Custom hook to manage form state for a Facebook bot.
 *
 * @param facebookBotId - The ID of the Facebook bot to load data for.
 *                        If null, a new bot form will be initialized.
 */

export const useFacebookBotForm = (facebookBotId: string | null) => {
  const { data, loading: loadingDetail } =
    useQuery<FacebookBotDetailQueryResponse>(FACEBOOK_BOT_DETAIL, {
      variables: { _id: facebookBotId },
      skip: !facebookBotId,
    });
  const { facebookMessengerBot } = data || {};

  const formDefaultValues = {
    name: facebookMessengerBot?.name,
    persistentMenus: facebookMessengerBot?.persistentMenus || [
      {
        _id: generateAutomationElementId(),
        text: 'Get Started',
        type: 'button',
        disableRemove: true,
      },
    ],
    tag: facebookMessengerBot?.tag || 'CONFIRMED_EVENT_UPDATE',
    greetText: facebookMessengerBot?.greetText,
    isEnabledBackBtn: facebookMessengerBot?.isEnabledBackBtn,
    backButtonText: facebookMessengerBot?.backButtonText,
    accountId: facebookMessengerBot?.accountId,
    pageId: facebookMessengerBot?.pageId,
  };

  return {
    loadingDetail,

    formDefaultValues,
  };
};
