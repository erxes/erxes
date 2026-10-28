import { useQuery } from '@apollo/client';
import { STRUCTURE_ENTITY_DETAIL } from '../graphql/structureEntityQueries';
import { IStructureEntityDetail } from '../types/structureEntity';

export const useStructureEntityDetail = (entityId?: string | null) => {
  const { data, loading, error } = useQuery<
    { structureEntityDetail: IStructureEntityDetail },
    { _id: string }
  >(STRUCTURE_ENTITY_DETAIL, {
    variables: { _id: entityId ?? '' },
    skip: !entityId,
    fetchPolicy: 'cache-and-network',
  });

  return {
    entity: data?.structureEntityDetail,
    loading: loading && !data,
    error,
  };
};
