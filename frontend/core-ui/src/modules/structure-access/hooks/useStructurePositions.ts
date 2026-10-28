import { useQuery } from '@apollo/client';
import { STRUCTURE_ACCESS_POSITIONS } from '../graphql/structureAccessQueries';
import { IStructureAccessPosition } from '../types';

export const useStructurePositions = ({
  searchValue,
  skip,
}: { searchValue?: string; skip?: boolean } = {}) => {
  const { data, loading, error } = useQuery<
    { structurePositions: IStructureAccessPosition[] },
    { searchValue?: string }
  >(STRUCTURE_ACCESS_POSITIONS, {
    variables: { searchValue },
    skip,
    fetchPolicy: 'cache-and-network',
  });

  return {
    positions: data?.structurePositions ?? [],
    loading: loading && !data,
    error,
  };
};
