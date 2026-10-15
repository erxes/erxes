import { useMutation } from '@apollo/client';
import { useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { QUERY_ASSIGNMENT_CAMPAIGNS } from '../../graphql';
import { UPDATE_ASSIGNMENT_CAMPAIGN } from '../../graphql/mutations/assignmentEditStatusMutations';

export const useAssignmentEdit = () => {
  const { t } = useTranslation('loyalty');
  const { toast } = useToast();

  const [assignmentEdit, { loading }] = useMutation(
    UPDATE_ASSIGNMENT_CAMPAIGN,
    {
      refetchQueries: [QUERY_ASSIGNMENT_CAMPAIGNS],
      onCompleted: () => {
        toast({
          title: t('success'),
          description: t('assignment-updated'),
          variant: 'default',
        });
      },
      onError: (error) => {
        toast({
          title: t('error'),
          description: error.message,
          variant: 'destructive',
        });
      },
    },
  );

  return { assignmentEdit, loading };
};
