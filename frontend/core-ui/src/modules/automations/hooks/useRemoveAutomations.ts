import { AUTOMATION_REMOVE } from '@/automations/graphql/automationMutations';
import { OperationVariables, useMutation } from '@apollo/client';
import { AUTOMATIONS_MAIN_LIST } from '@/automations/graphql/automationQueries';

export const useRemoveAutomations = () => {
  const [automationsRemove, { loading }] = useMutation(AUTOMATION_REMOVE);
  const removeAutomations = async (
    automationIds: string[],
    options?: OperationVariables,
  ) => {
    await automationsRemove({
      ...options,
      variables: { ids: automationIds, ...options?.variables },
      refetchQueries: [AUTOMATIONS_MAIN_LIST],
    });
  };
  return { removeAutomations, loading };
};
