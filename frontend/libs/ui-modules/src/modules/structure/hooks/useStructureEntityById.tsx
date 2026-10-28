import { QueryHookOptions, useQuery } from '@apollo/client';
import { STRUCTURE_ENTITY_DETAIL_SELECT } from '../graphql/queries/getStructureEntities';
import { IStructureEntityDetailData } from '../types/StructureEntity';

export const useStructureEntityById = (
  id?: string,
  options?: QueryHookOptions<IStructureEntityDetailData, { _id: string }>,
) => {
  const { data, loading, error } = useQuery<
    IStructureEntityDetailData,
    { _id: string }
  >(STRUCTURE_ENTITY_DETAIL_SELECT, {
    ...options,
    variables: id ? { _id: id } : undefined,
    skip: !id || options?.skip,
  });

  return {
    structureEntity: data?.structureEntityDetail,
    loading,
    error,
  };
};
