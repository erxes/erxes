import {
  INSTAGRAM_BOTS_LIST,
  INSTAGRAM_BOTS_TOTAL_COUNT,
  INSTAGRAM_BOT_DETAIL,
} from '@/integrations/instagram/graphql/queries/instagramBots';
import { resetInstagramAddStateAtom } from '@/integrations/instagram/states/instagramStates';
import { useMutation, useQuery } from '@apollo/client';
import { toast, useQueryState } from 'erxes-ui';
import { useSetAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { generateAutomationElementId } from 'ui-modules';
import { z } from 'zod';
import {
  ADD_INSTAGRAM_BOT,
  UPDATE_INSTAGRAM_BOT,
} from '~/widgets/automations/modules/instagram/components/bots/graphql/automationBotsMutations';
import { instagramBotFormSchema } from '~/widgets/automations/modules/instagram/components/bots/states/instagramBotForm';
import {
  isOpenInstagramBotSecondarySheet,
  isOpenInstagramBotSheet,
} from '~/widgets/automations/modules/instagram/components/bots/states/instagramBotStates';
import { InstagramBotDetailQueryResponse } from '~/widgets/automations/modules/instagram/components/bots/types/instagramBotTypes';

export const useInstagramBotSave = () => {
  const { t } = useTranslation('frontline');
  const [instagramBotId, setInstagramBotId] =
    useQueryState<string>('instagramBotId');
  const resetForm = useSetAtom(resetInstagramAddStateAtom);
  const setOpenSheet = useSetAtom(isOpenInstagramBotSheet);
  const setOpenSecondarySheet = useSetAtom(isOpenInstagramBotSecondarySheet);

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
      refetchQueries: [
        { query: INSTAGRAM_BOTS_LIST },
        { query: INSTAGRAM_BOTS_TOTAL_COUNT },
      ],
      awaitRefetchQueries: true,
      onCompleted: () => {
        toast({
          title: t('save-successful'),
        });

        setOpenSecondarySheet(false);
        setOpenSheet(false);
        setInstagramBotId(null);
        resetForm();
      },
      onError: (error) => {
        toast({
          variant: 'destructive',
          title: t('something-went-wrong'),
          description: error?.message,
        });
      },
    });
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
