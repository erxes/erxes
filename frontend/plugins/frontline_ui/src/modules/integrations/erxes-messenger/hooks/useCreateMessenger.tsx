import { useApolloClient, useMutation } from '@apollo/client';
import { useSocialIntegrationCreate } from '@/integrations/hooks/useSocialIntegrationCreate';
import {
  CREATE_EM_MESSENGER_MUTATION,
  EDIT_EM_MESSENGER_MUTATION,
  SAVE_EM_CONFIGS_MUTATION,
  SAVE_EM_APPEARANCE_MUTATION,
  SAVE_EM_TICKET_CONFIG_MUTATION,
} from '../graphql/mutations/createEmMessengerMutations';
import { toast } from 'erxes-ui';
import { useAtomValue } from 'jotai';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { EM_CONFIG_SCHEMA } from '@/integrations/erxes-messenger/constants/emConfigSchema';
import { erxesMessengerSetupValuesAtom } from '@/integrations/erxes-messenger/states/EMStateValues';

export const useCreateMessenger = () => {
  const { t } = useTranslation('frontline', {
    keyPrefix: 'modules.integrations',
  });
  const client = useApolloClient();
  const { runCreate, loading: pending } = useSocialIntegrationCreate();
  const [createMessengerMutation, { loading: createLoading }] = useMutation(
    CREATE_EM_MESSENGER_MUTATION,
  );
  const [editMessengerMutation, { loading: editLoading }] = useMutation(
    EDIT_EM_MESSENGER_MUTATION,
  );
  const [saveConfigsMutation, { loading: saveConfigsLoading }] = useMutation(
    SAVE_EM_CONFIGS_MUTATION,
  );
  const [saveAppearanceMutation, { loading: saveAppearanceLoading }] =
    useMutation(SAVE_EM_APPEARANCE_MUTATION);
  const [saveTicketConfigMutation, { loading: saveTicketConfigLoading }] =
    useMutation(SAVE_EM_TICKET_CONFIG_MUTATION);

  const readVariables = useAtomValue(erxesMessengerSetupValuesAtom);

  const createMessenger = (
    configFormValues: z.infer<typeof EM_CONFIG_SCHEMA>,
  ) => {
    const { createVariables, saveConfigVariables, uiOptions } =
      readVariables(configFormValues);
    return runCreate(async (created, existingId) => {
      const id = existingId
        ? (
            await editMessengerMutation({
              variables: { id: existingId, ...createVariables },
            })
          ).data?.integrationsEditMessengerIntegration?._id
        : (
            await createMessengerMutation({
              variables: createVariables,
            })
          ).data?.integrationsCreateMessengerIntegration?._id;
      if (!id) throw new Error(t('failed-to-create-messenger'));
      created(id);
      const results = await Promise.allSettled([
        saveConfigsMutation({
          variables: {
            _id: id,
            brandId: createVariables.brandId,
            ...saveConfigVariables,
          },
        }),
        saveAppearanceMutation({
          variables: { _id: id, brandId: configFormValues.brandId, uiOptions },
        }),
        saveTicketConfigMutation({
          variables: { _id: id, configIds: configFormValues.ticketConfigIds },
        }),
      ]);
      const failed = results.find((result) => result.status === 'rejected');
      if (failed?.status === 'rejected') throw failed.reason;
      const [configs, appearance, tickets] = results;
      if (
        configs.status !== 'fulfilled' ||
        !configs.value.data?.integrationsSaveMessengerConfigs?._id ||
        appearance.status !== 'fulfilled' ||
        !appearance.value.data?.integrationsSaveMessengerAppearanceData?._id ||
        tickets.status !== 'fulfilled' ||
        !tickets.value.data?.integrationsSaveMessengerTicketData?._id
      )
        throw new Error(t('failed-to-create-messenger'));
      await client.refetchQueries({
        include: [
          'Integrations',
          'ErxesMessengerIntegrationDetail',
          'ChannelIntegrationsPeek',
        ],
      });
      toast({ title: t('integration-added') });
      return id;
    });
  };

  return {
    createMessenger,
    loading:
      pending ||
      createLoading ||
      editLoading ||
      saveConfigsLoading ||
      saveAppearanceLoading ||
      saveTicketConfigLoading,
  };
};
