import { PROJECTS_CURSOR_SESSION_KEY } from '@/project/constants/ProjectSessionKey';
import { UPDATE_MILESTONE_MUTATION } from '@/project/graphql/mutation/updateMilestone';
import { useMutation } from '@apollo/client';
import { useRecordTableCursor, useToast } from 'erxes-ui';

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

  return {
    updateMilestone: updateMilestoneMutation,
    loading,
    error,
  };
};
