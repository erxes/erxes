import { PROJECTS_CURSOR_SESSION_KEY } from '@/project/constants/ProjectSessionKey';
import { CREATE_MILESTONE_MUTATION } from '@/project/graphql/mutation/createMilestone';
import { GET_PROJECT_PROGRESS_BY_MILESTONE } from '@/project/graphql/queries/getProjectProgressByMilestone';
import { useMutation } from '@apollo/client';
import { useRecordTableCursor, useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const useCreateMilestone = () => {
  const { t } = useTranslation('operation');
  const { toast } = useToast();
  const { setCursor } = useRecordTableCursor({
    sessionKey: PROJECTS_CURSOR_SESSION_KEY,
  });

  const [createMilestoneMutation, { loading, error }] = useMutation(
    CREATE_MILESTONE_MUTATION,
    {
      onCompleted: () => {
        toast({
          title: t('success'),
          description: t('milestone-created-successfully'),
          variant: 'default',
        });
        setCursor('');
      },
      onError: (e) => {
        toast({
          title: t('error'),
          description: e.message,
          variant: 'destructive',
        });
      },
      update: (cache, { data }) => {
        const newMilestone = {
          ...data.createMilestone,
          totalScope: 0,
          totalStartedScope: 0,
          totalCompletedScope: 0,
        };

        const existingData = cache.readQuery<{ milestoneProgress: any[] }>({
          query: GET_PROJECT_PROGRESS_BY_MILESTONE,
          variables: { projectId: data?.createMilestone?.projectId },
        });
        if (!existingData) return;

        cache.writeQuery({
          query: GET_PROJECT_PROGRESS_BY_MILESTONE,
          variables: { projectId: data?.createMilestone?.projectId },
          data: {
            milestoneProgress: [
              newMilestone,
              ...existingData.milestoneProgress,
            ],
          },
        });
      },
    },
  );

  return {
    createMilestone: createMilestoneMutation,
    loading,
    error,
  };
};
