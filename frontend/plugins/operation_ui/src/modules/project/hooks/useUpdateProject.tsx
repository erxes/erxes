import { useMutation, MutationHookOptions } from '@apollo/client';
import { UPDATE_PROJECT_MUTATION } from '../graphql/mutation/updateProject';
import { useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import type {
  UpdateProjectMutation,
  UpdateProjectMutationVariables,
} from '~/gql/graphql';

export const useUpdateProject = () => {
  const { t } = useTranslation('operation');
  const { toast } = useToast();
  const [_updateProject, { loading, error }] = useMutation(
    UPDATE_PROJECT_MUTATION,
  );
  const updateProject = (
    options: MutationHookOptions<
      UpdateProjectMutation,
      UpdateProjectMutationVariables
    >,
  ) => {
    return _updateProject({
      ...options,
      onError: (error) => {
        toast({
          title: t('error'),
          description: error.message,
          variant: 'destructive',
        });
      },
    });
  };

  return { updateProject, loading, error };
};
