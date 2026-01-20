import { INSTAGRAM_BOT_DETAIL } from '@/integrations/instagram/graphql/queries/instagramBots';
import { resetInstagramAddStateAtom } from '@/integrations/instagram/states/instagramStates';
import { useMutation, useQuery } from '@apollo/client';
import { toast, useQueryState } from 'erxes-ui';
import { useSetAtom } from 'jotai';
import { generateAutomationElementId } from 'ui-modules';
import { z } from 'zod';
import {
  ADD_INSTAGRAM_BOT,
  UPDATE_INSTAGRAM_BOT,
} from '~/widgets/automations/modules/instagram/components/bots/graphql/automationBotsMutation';
import { instagramBotFormSchema } from '~/widgets/automations/modules/instagram/components/bots/states/instagramBotForm';
import { InstagramBotDetailQueryResponse } from '~/widgets/automations/modules/instagram/components/bots/types/instagramBotTypes';

export const useInstagramBotSave = () => {
  const [instagramBotId] = useQueryState<string>('facebookBotId');
  const resetForm = useSetAtom(resetInstagramAddStateAtom);

  const [save, { loading: onSaveloading }] = useMutation(
    instagramBotId ? UPDATE_INSTAGRAM_BOT : ADD_INSTAGRAM_BOT,
  );

  const onSave = (values: z.infer<typeof instagramBotFormSchema>) => {
    const variables = {
      ...values,
      _id: instagramBotId || undefined,
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

export const useInstagramBotForm = (instagramBotId: string | null) => {
  const { data, loading: loadingDetail } =
    useQuery<InstagramBotDetailQueryResponse>(INSTAGRAM_BOT_DETAIL, {
      variables: { _id: instagramBotId },
      skip: !instagramBotId,
    });
  const { instagramMessengerBot } = data || {};

  return {
    loadingDetail,
    instagramMessengerBot,
  };
};
