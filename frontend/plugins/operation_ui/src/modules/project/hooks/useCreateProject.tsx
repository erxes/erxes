import { useMutation } from '@apollo/client';
import { CREATE_PROJECT_MUTATION } from '@/project/graphql/mutation/createProject';
import { useToast } from 'erxes-ui';
import { useRecordTableCursor } from 'erxes-ui';
import { PROJECTS_CURSOR_SESSION_KEY } from '@/project/constants/ProjectSessionKey';

export const useCreateProject = () => {
  const { toast } = useToast();
  const { setCursor } = useRecordTableCursor({
    sessionKey: PROJECTS_CURSOR_SESSION_KEY,
  });

  const [createProjectMutation, { loading, error }] = useMutation(
    CREATE_PROJECT_MUTATION,
    {
      onCompleted: () => {
        toast({
          title: 'Success',
          description: 'Project created successfully',
          variant: 'default',
        });
        setCursor('');
      },
      onError: (e) => {
        toast({
          title: 'Error',
          description: e.message,
          variant: 'destructive',
        });
      },
    },
  );

  return {
    createProject: createProjectMutation,
    loading,
    error,
  };
};
