import { AUTOMATION_DUPLICATE } from '@/automations/graphql/automationMutations';
import { AUTOMATIONS_MAIN_LIST } from '@/automations/graphql/automationQueries';
import { OperationVariables, useMutation } from '@apollo/client';

export const useDuplicateAutomation = () => {
  const [automationsDuplicate, { loading }] = useMutation(AUTOMATION_DUPLICATE);

  const duplicateAutomation = async (
    automationId: string,
    options?: OperationVariables,
  ) => {
    await automationsDuplicate({
      ...options,
      variables: { id: automationId, ...options?.variables },
      refetchQueries: [AUTOMATIONS_MAIN_LIST],
    });
  };

  return { duplicateAutomation, loading };
};
