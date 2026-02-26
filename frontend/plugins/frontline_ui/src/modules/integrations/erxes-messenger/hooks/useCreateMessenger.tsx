import { useApolloClient, useMutation } from '@apollo/client';
import {
  CREATE_EM_MESSENGER_MUTATION,
  SAVE_EM_CONFIGS_MUTATION,
  SAVE_EM_APPEARANCE_MUTATION,
  SAVE_EM_TICKET_CONFIG_MUTATION,
} from '../graphql/mutations/createEmMessengerMutations';
import { toast } from 'erxes-ui';
import { useAtomValue } from 'jotai';
import { z } from 'zod';
import { EM_CONFIG_SCHEMA } from '@/integrations/erxes-messenger/constants/emConfigSchema';
import { erxesMessengerSetupValuesAtom } from '@/integrations/erxes-messenger/states/EMStateValues';

export const useCreateMessenger = () => {
  const client = useApolloClient();

  const [createMessengerMutation, { loading: createLoading }] = useMutation(
    CREATE_EM_MESSENGER_MUTATION,
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
    onComplete?: () => void,
  ) => {
    const { createVariables, saveConfigVariables, uiOptions } =
      readVariables(configFormValues);

    createMessengerMutation({
      variables: createVariables,
      async onCompleted({ integrationsCreateMessengerIntegration }) {
        const { _id } = integrationsCreateMessengerIntegration;

        // Run all three saves in parallel and wait for every one to finish
        // before refetching — guarantees integrationDetail reflects ALL
        // updated fields (messengerData + uiOptions + ticketConfigId) at once.
        await Promise.all([
          saveConfigsMutation({
            variables: {
              _id,
              channelId: createVariables.channelId,
              ...saveConfigVariables,
            },
          }).catch((e) =>
            toast({
              title: 'Failed to save configs',
              description: e.message,
              variant: 'destructive',
            }),
          ),
          saveAppearanceMutation({
            variables: {
              _id,
              channelId: configFormValues.channelId,
              uiOptions,
            },
          }).catch((e) =>
            toast({
              title: 'Failed to save appearance',
              description: e.message,
              variant: 'destructive',
            }),
          ),
          saveTicketConfigMutation({
            variables: {
              _id,
              configId: configFormValues.ticketConfigId,
            },
          }).catch((e) =>
            toast({
              title: 'Failed to save ticket config',
              description: e.message,
              variant: 'destructive',
            }),
          ),
        ]);

        // Single refetch after everything is done
        await client.refetchQueries({ include: ['Integrations', 'integrationDetail'] });

        // Now close the sheet / reset state.
        onComplete?.();
      },
      onError(e) {
        toast({
          title: 'Failed to create messenger',
          description: e.message,
          variant: 'destructive',
        });
      },
    });
  };

  return {
    createMessenger,
    loading:
      createLoading ||
      saveConfigsLoading ||
      saveAppearanceLoading ||
      saveTicketConfigLoading,
  };
};
