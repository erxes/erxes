import { useQuery } from '@apollo/client';
import { STRUCTURE_ACCESS_ROOT } from '../graphql/structureAccessQueries';
import { IStructureAccessEntity } from '../types';

export const useStructureRoot = ({ skip }: { skip?: boolean } = {}) => {
  const { data, loading, error } = useQuery<{
    structureEntityRoot: IStructureAccessEntity | null;
  }>(STRUCTURE_ACCESS_ROOT, { skip });

  return {
    root: data?.structureEntityRoot ?? undefined,
    loading,
    error,
  };
};
