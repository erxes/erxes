import { useMutation, MutationHookOptions } from '@apollo/client';
import { REMOVE_PROJECT_MUTATION } from '../graphql/mutation/removeProject';
import { useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const useRemoveProject = () => {
  const { t } = useTranslation('operation');
  const { toast } = useToast();
  const [removeProjectMutation, { loading, error }] = useMutation(
    REMOVE_PROJECT_MUTATION,
    {
      refetchQueries: ['projects', 'GetProjects'],
    },
  );

  const removeProject = (options: MutationHookOptions) => {
    return removeProjectMutation({
      ...options,
      onCompleted: () => {
        toast({
          title: t('success', 'Success'),
          description: t('project-removed-successfully', 'Project removed successfully'),
          variant: 'success',
        });
      },
      onError: (error) => {
        toast({
          title: t('error', 'Error'),
          description: error.message,
          variant: 'destructive',
        });
      },
    });
  };

  return { removeProject, loading, error };
};
