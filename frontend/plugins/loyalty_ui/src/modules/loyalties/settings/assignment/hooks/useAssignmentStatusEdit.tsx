import { MutationHookOptions, useMutation } from '@apollo/client';
import { useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { UPDATE_ASSIGNMENT_CAMPAIGN } from '../graphql/mutations/assignmentEditStatusMutations';
import { QUERY_ASSIGNMENT_CAMPAIGNS } from '../graphql/queries/getCampaignsQuery';

export function useAssignmentStatusEdit() {
  const { t } = useTranslation('loyalty');
  const { toast } = useToast();

  const [editAssignment, { loading, error }] = useMutation(
    UPDATE_ASSIGNMENT_CAMPAIGN,
    {
      refetchQueries: [
        {
          query: QUERY_ASSIGNMENT_CAMPAIGNS,
        },
      ],
    },
  );

  const editStatus = async (options: MutationHookOptions<any, any>) => {
    const { variables } = options;

    return editAssignment({
      variables: {
        _id: variables._id,
        status: variables.status,
      },
      onCompleted: (data) => {
        toast({
          title: t('success'),
          description: t('assignment-status-updated'),
          variant: 'default',
        });
        options?.onCompleted?.(data);
      },
      onError: (err) => {
        toast({
          title: t('error'),
          description: err.message,
          variant: 'destructive',
        });
        options?.onError?.(err);
      },
    });
  };

  return { editStatus, loading, error };
}
