import { MutationHookOptions, useMutation } from '@apollo/client';
import { useRecordTableCursor, useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { ASSIGNMENTS_CURSOR_SESSION_KEY } from '../constants/assignmentsCursorSessionKey';
import { CREATE_ASSIGNMENT_CAMPAIGN } from '../graphql/mutations/AssignmentMutations';
import { QUERY_ASSIGNMENT_CAMPAIGNS } from '../graphql/queries/getCampaignsQuery';
import { ASSIGNMENTS_PER_PAGE } from './useAssignments';

export interface AddAssignmentResult {
  createCampaign: any;
}

export interface AddAssignmentVariables {
  title?: string;
  description?: string;
  status?: string;
  startDate?: Date;
  endDate?: Date;
  finishDateOfUse?: Date;
  attachment?: string;
  voucherCampaignId?: string;
  segmentIds?: string[];
}

export const useAddAssignment = () => {
  const { t } = useTranslation('loyalty');
  const { toast } = useToast();
  const { cursor } = useRecordTableCursor({
    sessionKey: ASSIGNMENTS_CURSOR_SESSION_KEY,
  });
  const [addAssignment, { loading, error }] = useMutation<
    AddAssignmentResult,
    AddAssignmentVariables
  >(CREATE_ASSIGNMENT_CAMPAIGN, {
    refetchQueries: [
      {
        query: QUERY_ASSIGNMENT_CAMPAIGNS,
        variables: { limit: ASSIGNMENTS_PER_PAGE, cursor },
      },
    ],
    update: (cache, { data }) => {
      try {
        const newCampaign = data?.createCampaign;

        if (!newCampaign) {
          return;
        }

        const existingData: any = cache.readQuery({
          query: QUERY_ASSIGNMENT_CAMPAIGNS,
          variables: {
            limit: ASSIGNMENTS_PER_PAGE,
            cursor,
          },
        });

        if (!existingData?.getCampaigns) {
          return;
        }

        cache.writeQuery({
          query: QUERY_ASSIGNMENT_CAMPAIGNS,
          variables: {
            limit: ASSIGNMENTS_PER_PAGE,
            cursor,
          },
          data: {
            getCampaigns: {
              ...existingData.getCampaigns,
              list: [newCampaign, ...existingData.getCampaigns.list],
              totalCount: (existingData.getCampaigns.totalCount || 0) + 1,
            },
          },
        });
      } catch (e) {
        console.error('Cache update error:', e);
      }
    },
  });

  const assignmentAdd = async (
    options: MutationHookOptions<AddAssignmentResult, AddAssignmentVariables>,
  ) => {
    return addAssignment({
      ...options,
      onCompleted: (data) => {
        toast({
          title: t('success'),
          description: t('assignment-campaign-created'),
          variant: 'default',
        });
        options?.onCompleted?.(data);
      },
      onError: (error) => {
        toast({
          title: t('error'),
          description: error.message,
          variant: 'destructive',
        });
        options?.onError?.(error);
      },
    });
  };

  return {
    assignmentAdd,
    loading,
    error,
  };
};
