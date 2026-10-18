import { isRecord } from '@/deals/utils/dealJson';
import { useQuery } from '@apollo/client';
import type { SalesPosSettingsListQueryVariables } from '~/gql/graphql';
import { queries } from '../graphql/queries';
import { hasId } from '../utils/posJson';

const POS_PER_PAGE = 30;

export const usePosList = (
  options: SalesPosSettingsListQueryVariables = {},
) => {
  const { data, loading, fetchMore } = useQuery(queries.posList, {
    variables: {
      perPage: POS_PER_PAGE,
      ...options,
    },
  });

  const transformedPosList =
    data?.posList?.filter(hasId).map((pos) => ({
      _id: pos._id,
      name: pos.name,
      isOnline: pos.isOnline || false,
      onServer: pos.onServer || false,
      branchTitle: pos.branchTitle || '',
      departmentTitle: pos.departmentTitle || '',
      createdAt: pos.createdAt,
      createdBy: pos?.user?.details?.fullName || 'Admin',
      logo:
        isRecord(pos.uiOptions) && typeof pos.uiOptions.logo === 'string'
          ? pos.uiOptions.logo
          : '',
      adminIds: pos?.adminIds,
      cashierIds: pos?.cashierIds,
      description: pos?.description,
    })) || [];

  const handleFetchMore = () => {
    if (!data?.posList) {
      return;
    }

    fetchMore({
      variables: {
        page: Math.ceil(transformedPosList.length / POS_PER_PAGE) + 1,
        perPage: POS_PER_PAGE,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) {
          return prev;
        }
        return Object.assign({}, prev, {
          posList: [
            ...(prev.posList || []),
            ...(fetchMoreResult.posList ?? []),
          ],
        });
      },
    });
  };

  return {
    loading,
    posList: transformedPosList,
    totalCount: data?.posList?.length || 0,
    handleFetchMore,
    pageInfo: {
      hasNextPage: transformedPosList.length < (data?.posList?.length || 0),
      hasPreviousPage: false,
      startCursor: null,
      endCursor: null,
    },
  };
};
