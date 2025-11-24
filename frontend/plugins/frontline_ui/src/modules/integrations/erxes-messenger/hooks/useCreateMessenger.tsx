import { useMutation } from '@apollo/client';
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
  const [createMessengerMutation, { loading: createLoading }] = useMutation(
    CREATE_EM_MESSENGER_MUTATION,
  );
  const [saveConfigsMutation, { loading: saveConfigsLoading }] = useMutation(
    SAVE_EM_CONFIGS_MUTATION,
  );
  const [saveAppearanceMutation, { loading: saveAppearanceLoading }] =
    useMutation(SAVE_EM_APPEARANCE_MUTATION, {
      refetchQueries: ['Integrations'],
    });
  const [saveTicketConfigMutation, { loading: saveTicketConfigLoading }] =
    useMutation(SAVE_EM_TICKET_CONFIG_MUTATION, {
      refetchQueries: ['Integrations'],
    });

  const readVariables = useAtomValue(erxesMessengerSetupValuesAtom);

  const createMessenger = (
    configFormValues: z.infer<typeof EM_CONFIG_SCHEMA>,
    onComplete?: () => void,
  ) => {
    const { createVariables, saveConfigVariables, uiOptions } =
      readVariables(configFormValues);

    createMessengerMutation({
      variables: createVariables,
      onCompleted({ integrationsCreateMessengerIntegration }) {
        const { _id } = integrationsCreateMessengerIntegration;
        onComplete?.();

        saveConfigsMutation({
          variables: {
            _id,
            channelId: createVariables.channelId,
            ...saveConfigVariables,
          },
          onError(e) {
            toast({
              title: 'Failed to save configs',
              description: e.message,
              variant: 'destructive',
            });
          },
        });
        saveAppearanceMutation({
          variables: {
            _id,
            channelId: configFormValues.channelId,
            uiOptions,
          },
          onError(e) {
            toast({
              title: 'Failed to save appearance',
              description: e.message,
              variant: 'destructive',
            });
          },
        });
        saveTicketConfigMutation({
          variables: {
            _id,
            configId: configFormValues.ticketConfigId,
          },
          onError(e) {
            toast({
              title: 'Failed to save ticket config',
              description: e.message,
              variant: 'destructive',
            });
          },
        });
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
    loading: createLoading || saveConfigsLoading || saveAppearanceLoading,
  };
};
