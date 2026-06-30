import { AUTOMATION_APPROVAL_CONTENT_TYPES } from '@/automations/constants';
import { AUTOMATIONS_MAIN_LIST } from '@/automations/graphql/automationQueries';
import { IAutomation } from '@/automations/types';
import { QueryHookOptions, useQuery } from '@apollo/client';
import {
  EnumCursorDirection,
  mergeCursorData,
  validateFetchMore,
} from 'erxes-ui';
import { IPageInfo, useApprovalLockStates } from 'ui-modules';
import { useAutomationRecordTableFilters } from './useAutomationRecordTableFilters';

type QueryResponse = {
  automationsMain: {
    list: IAutomation[];
    totalCount: number;
    pageInfo: IPageInfo;
  };
};

export const useAutomationsRecordTable = (
  options?: QueryHookOptions<QueryResponse>,
) => {
  const filters = useAutomationRecordTableFilters();
  const { data, loading, fetchMore } = useQuery<QueryResponse>(
    AUTOMATIONS_MAIN_LIST,
    {
      ...(options || {}),
      variables: {
        ...filters,
      },
    },
  );

  const { list = [], totalCount = 0, pageInfo } = data?.automationsMain || {};
  const { hasPreviousPage, hasNextPage } = pageInfo || {};
  const { statesByContentId: approvalLockStatesById } = useApprovalLockStates(
    {
      contentType: AUTOMATION_APPROVAL_CONTENT_TYPES.AUTOMATION,
      contentIds: list.map((automation) => automation._id),
      ownerIdsByContentId: list.reduce<Record<string, string>>(
        (ownerIds, automation) => {
          if (automation.createdBy) {
            ownerIds[automation._id] = automation.createdBy;
          }

          return ownerIds;
        },
        {},
      ),
      action: 'edit',
    },
    {
      skip: list.length === 0,
    },
  );

  const handleFetchMore = ({
    direction,
  }: {
    direction: EnumCursorDirection;
  }) => {
    if (
      !validateFetchMore({
        direction,
        pageInfo,
      })
    ) {
      return;
    }

    fetchMore({
      variables: {
        cursor:
          direction === EnumCursorDirection.FORWARD
            ? pageInfo?.endCursor
            : pageInfo?.startCursor,
        limit: 10,
        direction,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;
        return Object.assign({}, prev, {
          automationsMain: mergeCursorData({
            direction,
            fetchMoreResult: fetchMoreResult.automationsMain,
            prevResult: prev.automationsMain,
          }),
        });
      },
    });
  };

  return {
    list,
    loading,
    totalCount,
    pageInfo,
    handleFetchMore,
    hasNextPage,
    hasPreviousPage,
    approvalLockStatesById,
  };
};
