import { MutationHookOptions, useMutation } from '@apollo/client';
import { useRecordTableCursor, useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import type {
  CreateAssignmentCampaignMutation,
  CreateAssignmentCampaignMutationVariables,
} from '~/gql/graphql';
import { ASSIGNMENTS_CURSOR_SESSION_KEY } from '../constants/assignmentsCursorSessionKey';
import { CREATE_ASSIGNMENT_CAMPAIGN } from '../graphql/mutations/AssignmentMutations';
import { QUERY_ASSIGNMENT_CAMPAIGNS } from '../graphql/queries/getCampaignsQuery';
import { ASSIGNMENTS_PER_PAGE } from './useAssignments';

export const useAddAssignment = () => {
  const { t } = useTranslation('loyalty');
  const { toast } = useToast();
  const { cursor } = useRecordTableCursor({
    sessionKey: ASSIGNMENTS_CURSOR_SESSION_KEY,
  });
  const [addAssignment, { loading, error }] = useMutation(
    CREATE_ASSIGNMENT_CAMPAIGN,
    {
      refetchQueries: [
        {
          query: QUERY_ASSIGNMENT_CAMPAIGNS,
          variables: { limit: ASSIGNMENTS_PER_PAGE, cursor },
        },
      ],
    },
  );

  const assignmentAdd = async (
    options: MutationHookOptions<
      CreateAssignmentCampaignMutation,
      CreateAssignmentCampaignMutationVariables
    >,
  ) => {
    return addAssignment({
      ...options,
      onCompleted: (data) => {
        toast({
          title: t('success'),
          description: t('assignment-campaign-created'),
          variant: 'default',
        });
        options?.onCompleted?.(data);
      },
      onError: (error) => {
        toast({
          title: t('error'),
          description: error.message,
          variant: 'destructive',
        });
        options?.onError?.(error);
      },
    });
  };

  return {
    assignmentAdd,
    loading,
    error,
  };
};
