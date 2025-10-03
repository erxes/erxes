import { GET_PROJECTS } from '@/project/graphql/queries/getProjects';
import { CONVERT_TO_PROJECT } from '@/task/graphql/mutations/convertProject';
import { ApolloCache, useMutation } from '@apollo/client';
import { useToast } from 'erxes-ui';

export const useConvertToProject = () => {
  const { toast } = useToast();

  const [convertTaskMutation, { loading, error }] = useMutation(
    CONVERT_TO_PROJECT,
    {
      update: (cache: ApolloCache<any>, { data }) => {
        cache.updateQuery({ query: GET_PROJECTS }, (existingData) => {
          if (!existingData || !existingData.projects.list) return existingData;

          return {
            projects: {
              ...existingData.projects,
              list: [data.convertTask, ...existingData.projects.list],
              totalCount: existingData.projects.totalCount + 1,
            },
          };
        });
      },
      onCompleted: () => {
        toast({
          title: 'Success',
          description: 'Task converted into project successfully',
          variant: 'default',
        });
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
  return { convertTask: convertTaskMutation, loading, error };
};
