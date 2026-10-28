import { QueryHookOptions, useQuery } from '@apollo/client';
import {
  EnumCursorDirection,
  mergeCursorData,
  validateFetchMore,
} from 'erxes-ui';
import { STRUCTURE_ENTITIES_SELECT } from '../graphql/queries/getStructureEntities';
import {
  IStructureEntitiesData,
  IStructureEntitiesVariables,
} from '../types/StructureEntity';

export const useStructureEntities = (
  options?: QueryHookOptions<
    IStructureEntitiesData,
    IStructureEntitiesVariables
  >,
) => {
  const { data, loading, error, fetchMore } = useQuery<
    IStructureEntitiesData,
    IStructureEntitiesVariables
  >(STRUCTURE_ENTITIES_SELECT, options);

  const {
    list: structureEntities = [],
    totalCount = 0,
    pageInfo,
  } = data?.structureEntities || {};

  const handleFetchMore = () => {
    if (
      !validateFetchMore({ direction: EnumCursorDirection.FORWARD, pageInfo })
    ) {
      return;
    }

    fetchMore({
      variables: {
        cursor: pageInfo?.endCursor,
        direction: EnumCursorDirection.FORWARD,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) {
          return prev;
        }

        return {
          ...prev,
          structureEntities: {
            ...mergeCursorData({
              direction: EnumCursorDirection.FORWARD,
              fetchMoreResult: fetchMoreResult.structureEntities,
              prevResult: prev.structureEntities,
            }),
            totalCount: fetchMoreResult.structureEntities.totalCount,
          },
        };
      },
    });
  };

  return {
    structureEntities,
    totalCount,
    pageInfo,
    loading,
    error,
    handleFetchMore,
  };
};
