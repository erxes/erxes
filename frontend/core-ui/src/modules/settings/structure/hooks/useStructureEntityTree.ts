import { NetworkStatus, useQuery } from '@apollo/client';
import { EnumCursorDirection, mergeCursorData } from 'erxes-ui';
import { useEffect } from 'react';
import { STRUCTURE_ENTITIES_TREE } from '../graphql/structureEntityQueries';
import {
  IStructureEntitiesTreeData,
  IStructureEntitiesTreeVariables,
  TStructureTreeEntity,
} from '../types/structureEntity';

const STRUCTURE_TREE_PAGE_SIZE = 100;

const uniqueById = (entities: TStructureTreeEntity[]) => {
  const seen = new Set<string>();

  return entities.filter(({ _id }) => {
    if (seen.has(_id)) {
      return false;
    }

    seen.add(_id);

    return true;
  });
};

export const useStructureEntityTree = (includeArchived: boolean) => {
  const { data, loading, error, fetchMore, networkStatus } = useQuery<
    IStructureEntitiesTreeData,
    IStructureEntitiesTreeVariables
  >(STRUCTURE_ENTITIES_TREE, {
    variables: { includeArchived, limit: STRUCTURE_TREE_PAGE_SIZE },
    fetchPolicy: 'cache-and-network',
    notifyOnNetworkStatusChange: true,
  });

  const pageInfo = data?.structureEntities.pageInfo;
  const nextCursor = pageInfo?.hasNextPage ? pageInfo.endCursor ?? null : null;
  const ready = networkStatus === NetworkStatus.ready;

  useEffect(() => {
    if (!nextCursor || !ready) {
      return;
    }

    fetchMore({
      variables: {
        cursor: nextCursor,
        direction: EnumCursorDirection.FORWARD,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) {
          return prev;
        }

        const merged = mergeCursorData({
          direction: EnumCursorDirection.FORWARD,
          fetchMoreResult: fetchMoreResult.structureEntities,
          prevResult: prev.structureEntities,
        });

        return {
          ...prev,
          structureEntities: {
            ...merged,
            list: uniqueById(merged.list),
            totalCount: fetchMoreResult.structureEntities.totalCount,
          },
        };
      },
    });
  }, [nextCursor, ready, fetchMore]);

  return {
    entities: data?.structureEntities.list ?? [],
    loading: loading && !data,
    loadingMore: Boolean(nextCursor),
    error,
  };
};
