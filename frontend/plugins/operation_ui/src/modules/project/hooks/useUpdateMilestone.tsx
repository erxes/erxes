import { PROJECTS_CURSOR_SESSION_KEY } from '@/project/constants/ProjectSessionKey';
import { REMOVE_MILESTONE_MUTATION } from '@/project/graphql/mutation/removeMilestone';
import { UPDATE_MILESTONE_MUTATION } from '@/project/graphql/mutation/updateMilestone';
import { useMutation } from '@apollo/client';
import { useRecordTableCursor, useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { GET_PROJECT_PROGRESS_BY_MILESTONE } from '../graphql/queries/getProjectProgressByMilestone';
import { IMilestone, IMilestoneProgress } from '../types';

export const useUpdateMilestone = () => {
  const { t } = useTranslation('operation');
  const { toast } = useToast();
  const { setCursor } = useRecordTableCursor({
    sessionKey: PROJECTS_CURSOR_SESSION_KEY,
  });

  const [updateMilestoneMutation, { loading, error }] = useMutation(
    UPDATE_MILESTONE_MUTATION,
    {
      onCompleted: () => {
        toast({
          title: t('success'),
          description: t('milestone-updated-successfully'),
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
        const updatedMilestone = data?.updateMilestone;
        if (!updatedMilestone) {
          return;
        }

        cache.modify({
          id: cache.identify({
            __typename: 'MilestoneProgress',
            _id: updatedMilestone._id,
          }),
          fields: {
            name: () => updatedMilestone.name,
            targetDate: () => updatedMilestone.targetDate,
          },
        });
      },
    },
  );

  const [removeMilestoneMutation] = useMutation(REMOVE_MILESTONE_MUTATION, {
    onError: (e) => {
      toast({
        title: t('error'),
        description: e.message,
        variant: 'destructive',
      });
    },
    update: (cache, { data }) => {
      const removedMilestone = data?.removeMilestone;
      if (!removedMilestone) {
        return;
      }

      const removedId = removedMilestone._id;

      const existingData = cache.readQuery<{
        milestoneProgress: Array<IMilestone & IMilestoneProgress>;
      }>({
        query: GET_PROJECT_PROGRESS_BY_MILESTONE,
        variables: { projectId: removedMilestone.projectId },
      });

      if (!existingData) return;

      cache.writeQuery({
        query: GET_PROJECT_PROGRESS_BY_MILESTONE,
        variables: { projectId: removedMilestone.projectId },
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
