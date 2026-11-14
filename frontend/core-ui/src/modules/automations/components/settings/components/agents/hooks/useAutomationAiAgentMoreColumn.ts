import {
  AUTOMATIONS_AI_AGENT_REMOVE,
  AUTOMATIONS_AI_AGENTS,
} from '@/automations/components/settings/components/agents/graphql/automationsAiAgents';
import { AutomationSettingsPath } from '@/types/paths/AutomationPath';
import { ApolloError, useMutation } from '@apollo/client';
import { useConfirm, useToast } from 'erxes-ui';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router';

const CONFIRM_OPTIONS = { confirmationValue: 'delete' };

/** An agent row's menu: its edit link, and deleting it after a typed confirm. */
export const useAutomationAiAgentMoreColumn = (
  agentId: string,
  name?: string,
) => {
  const { search } = useLocation();
  const { confirm } = useConfirm();
  const { toast } = useToast();
  const { t } = useTranslation('automations');
  const [removeAiAgent, { loading }] = useMutation(AUTOMATIONS_AI_AGENT_REMOVE);

  const remove = useCallback(
    () =>
      removeAiAgent({
        variables: { id: agentId },
        refetchQueries: [AUTOMATIONS_AI_AGENTS],
        onError: (e: ApolloError) =>
          toast({
            title: t('error'),
            description: e.message,
            variant: 'destructive',
          }),
        onCompleted: () =>
          toast({
            title: t('success'),
            description: t('ai-agent-delete-success'),
            variant: 'success',
          }),
      }),
    [removeAiAgent, agentId, toast, t],
  );

  const requestDelete = useCallback(
    () =>
      confirm({
        message: t('ai-agent-delete-confirm-message', { name }),
        options: CONFIRM_OPTIONS,
      }).then(remove),
    [confirm, t, name, remove],
  );

  return {
    editHref: `${AutomationSettingsPath.Agents}/${agentId}${search}`,
    removing: loading,
    requestDelete,
  };
};
