import { useApolloClient, useMutation } from '@apollo/client';
import {
  EDIT_EM_MESSENGER_MUTATION,
  SAVE_EM_CONFIGS_MUTATION,
  SAVE_EM_APPEARANCE_MUTATION,
  SAVE_EM_TICKET_CONFIG_MUTATION,
} from '../graphql/mutations/createEmMessengerMutations';
import { toast } from 'erxes-ui';
import { isRecord } from '@/shared/utils/isRecord';
import { useStore } from 'jotai';
import { useContext } from 'react';
import { IntegrationDraftContext } from '@/integrations/hooks/useIntegrationDraft';
import { EM_INTEGRATION_DETAIL_QUERY } from '../graphql/queries/integrationDetailQuery';
import {
  getMessengerDraftValues,
  resolveMessengerDraft,
  refreshMessengerDraft,
  useMessengerSaving,
} from './useMessengerDraft';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { EM_CONFIG_SCHEMA } from '@/integrations/erxes-messenger/constants/emConfigSchema';
import { getMessengerVariables } from '@/integrations/erxes-messenger/states/EMStateValues';

export const useEditMessenger = () => {
  const { t } = useTranslation('frontline', {
    keyPrefix: 'modules.integrations',
  });
  const client = useApolloClient();

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

  const [saving, setSaving, updateSaving] = useMessengerSaving();
  const store = useStore();
  const key = useContext(IntegrationDraftContext);

  const editMessenger = async (
    _id: string,
    configFormValues: z.infer<typeof EM_CONFIG_SCHEMA>,
    onComplete?: () => void,
  ) => {
    let started = false;
    updateSaving((pending) => {
      if (pending) return pending;
      started = true;
      return true;
    });
    if (!started) return;
    const draft = {
      ...getMessengerDraftValues(store),
      config: configFormValues,
    };
    try {
      const { data } = await client.query({
        query: EM_INTEGRATION_DETAIL_QUERY,
        variables: { _id },
        fetchPolicy: 'no-cache',
      });
      if (!data?.integrationDetail)
        throw new Error(t('integration-not-found', 'Integration unavailable'));
      const values = resolveMessengerDraft(
        store,
        key,
        data.integrationDetail,
        draft,
      );
      const config = values.config ?? configFormValues;
      const { createVariables, saveConfigVariables, uiOptions } =
        getMessengerVariables(config, values);
      const result = await editMessengerMutation({
        variables: { id: _id, ...createVariables },
      });
      const id = result.data?.integrationsEditMessengerIntegration?._id;
      if (!id) throw new Error(t('failed-to-edit-messenger'));
      const currentData = isRecord(data.integrationDetail.messengerData)
        ? data.integrationDetail.messengerData
        : {};
      const results = await Promise.all([
        saveConfigsMutation({
          variables: {
            _id: id,
            brandId: config.brandId,
            messengerData: {
              ...saveConfigVariables.messengerData,
              botEndpointUrl:
                typeof currentData.botEndpointUrl === 'string'
                  ? currentData.botEndpointUrl
                  : '',
              getStarted:
                typeof currentData.getStarted === 'boolean'
                  ? currentData.getStarted
                  : undefined,
              skillData: currentData.skillData,
              messages: {
                ...(isRecord(currentData.messages) ? currentData.messages : {}),
                ...saveConfigVariables.messengerData.messages,
              },
            },
          },
        }),
        saveAppearanceMutation({
          variables: { _id: id, uiOptions, brandId: config.brandId },
        }),
        saveTicketConfigMutation({
          variables: { _id: id, configIds: config.ticketConfigIds },
        }),
      ]);
      if (results.some((saved) => !saved.data))
        throw new Error(t('failed-to-edit-messenger'));
      await client.refetchQueries({
        include: [
          'Integrations',
          'ErxesMessengerIntegrationDetail',
          'ChannelIntegrationsPeek',
        ],
      });
      const saved = await client.query({
        query: EM_INTEGRATION_DETAIL_QUERY,
        variables: { _id },
        fetchPolicy: 'no-cache',
      });
      if (!saved.data?.integrationDetail)
        throw new Error(t('failed-to-edit-messenger'));
      refreshMessengerDraft(store, key, saved.data.integrationDetail, values);
      onComplete?.();
    } catch (error: unknown) {
      toast({
        title: t('failed-to-edit-messenger'),
        description: error instanceof Error ? error.message : undefined,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return {
    editMessenger,
    loading:
      saving ||
      editLoading ||
      saveConfigsLoading ||
      saveAppearanceLoading ||
      saveTicketConfigLoading,
  };
};
