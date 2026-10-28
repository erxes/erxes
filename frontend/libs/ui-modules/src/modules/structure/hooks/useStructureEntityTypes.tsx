import { QueryHookOptions, useQuery } from '@apollo/client';
import { STRUCTURE_ENTITY_TYPES_SELECT } from '../graphql/queries/getStructureEntities';
import {
  IStructureEntityTypesData,
  IStructureEntityTypesVariables,
} from '../types/StructureEntity';

export const useStructureEntityTypes = (
  options?: QueryHookOptions<
    IStructureEntityTypesData,
    IStructureEntityTypesVariables
  >,
) => {
  const { data, loading, error } = useQuery<
    IStructureEntityTypesData,
    IStructureEntityTypesVariables
  >(STRUCTURE_ENTITY_TYPES_SELECT, options);

  return {
    structureEntityTypes: data?.structureEntityTypes || [],
    loading,
    error,
  };
};
