import { ApolloError } from '@apollo/client';
import { toast } from 'erxes-ui';
import { usePermissionCheck } from 'ui-modules';

type AgentAction = 'create' | 'edit' | 'delete';

/** Red toaster shown when a non-admin/owner attempts a restricted agent action. */
export const showAgentPermissionError = (action: AgentAction) =>
  toast({
    title: 'Permission denied',
    description: `You don't have permission to ${action} agents.`,
    variant: 'destructive',
  });

const isPermissionError = (e: ApolloError) =>
  e.graphQLErrors?.some((g) => g.extensions?.code === 'FORBIDDEN') ||
  /permission/i.test(e.message);

/** Apollo `onError` handler: permission denials get the friendly toast, other
 *  failures fall back to the raw message. Used as a backend-enforced safety net. */
export const agentMutationError = (action: AgentAction) => (e: ApolloError) =>
  isPermissionError(e)
    ? showAgentPermissionError(action)
    : toast({ title: 'Error', description: e.message, variant: 'destructive' });

/** Frontend gate mirroring the backend agentsCreate/agentsEdit/agentsRemove
 *  checks. Owners and wildcard admins pass automatically (see usePermissionCheck);
 *  the erxes-agent:user / :viewer groups do not hold these actions. */
export const useAgentAccess = () => {
  const { hasActionPermission } = usePermissionCheck();
  return {
    canCreate: hasActionPermission('agentsCreate'),
    canEdit: hasActionPermission('agentsEdit'),
    canRemove: hasActionPermission('agentsRemove'),
  };
};
