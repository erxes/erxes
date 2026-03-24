import { FACEBOOK_BOT_DETAIL } from '@/integrations/facebook/graphql/queries/facebookBots';
import { resetFacebookAddStateAtom } from '@/integrations/facebook/states/facebookStates';
import { useMutation, useQuery } from '@apollo/client';
import { toast, useQueryState } from 'erxes-ui';
import { useSetAtom } from 'jotai';
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
    const variables = {
      ...values,
      _id: facebookBotId || undefined,
    };
    save({
      variables,
      onCompleted: () => {
        toast({
          title: 'Save successful',
        });
      },
      onError: (error) => {
        toast({
          variant: 'destructive',
          title: 'Something went wrong',
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
