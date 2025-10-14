import { PROJECTS_CURSOR_SESSION_KEY } from '@/project/constants/ProjectSessionKey';
import { REMOVE_MILESTONE_MUTATION } from '@/project/graphql/mutation/removeMilestone';
import { UPDATE_MILESTONE_MUTATION } from '@/project/graphql/mutation/updateMilestone';
import { useMutation } from '@apollo/client';
import { useRecordTableCursor, useToast } from 'erxes-ui';
import { GET_PROJECT_PROGRESS_BY_MILESTONE } from '../graphql/queries/getProjectProgressByMilestone';

export const useUpdateMilestone = () => {
  const { toast } = useToast();
  const { setCursor } = useRecordTableCursor({
    sessionKey: PROJECTS_CURSOR_SESSION_KEY,
  });

  const [updateMilestoneMutation, { loading, error }] = useMutation(
    UPDATE_MILESTONE_MUTATION,
    {
      onCompleted: () => {
        toast({
          title: 'Success',
          description: 'Milestone updated successfully',
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
      update: (cache, { data }) => {
        cache.modify({
          id: cache.identify({
            __typename: 'MilestoneProgress',
            _id: data.updateMilestone._id,
          }),
          fields: {
            name: () => data.updateMilestone.name,
            targetDate: () => data.updateMilestone.targetDate,
          },
        });
      },
    },
  );

  const [removeMilestoneMutation] = useMutation(REMOVE_MILESTONE_MUTATION, {
    onError: (e) => {
      toast({
        title: 'Error',
        description: e.message,
        variant: 'destructive',
      });
    },
    update: (cache, { data }) => {
      const removedId = data.removeMilestone._id;

      const existingData = cache.readQuery<{ milestoneProgress: any[] }>({
        query: GET_PROJECT_PROGRESS_BY_MILESTONE,
        variables: { projectId: data.removeMilestone.projectId },
      });

      if (!existingData) return;

      cache.writeQuery({
        query: GET_PROJECT_PROGRESS_BY_MILESTONE,
        variables: { projectId: data.removeMilestone.projectId },
        data: {
          milestoneProgress: existingData.milestoneProgress.filter(
            (milestone) => milestone._id !== removedId,
          ),
        },
      });
    },
  });

  return {
    updateMilestone: updateMilestoneMutation,
    removeMilestone: removeMilestoneMutation,
    loading,
    error,
  };
};
