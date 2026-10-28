import { useQuery } from '@apollo/client';
import { useMemo } from 'react';
import {
  STRUCTURE_CAPABILITIES,
  STRUCTURE_ENTITY_TYPES_LIST,
} from '../graphql/structureEntityQueries';
import {
  IStructureCapability,
  IStructureEntityTypeDetail,
} from '../types/structureEntity';

export const useStructureEntityTypesList = () => {
  const { data, loading, error } = useQuery<{
    structureEntityTypes: IStructureEntityTypeDetail[];
  }>(STRUCTURE_ENTITY_TYPES_LIST, { fetchPolicy: 'cache-and-network' });

  const types = useMemo(() => data?.structureEntityTypes ?? [], [data]);
  const typesById = useMemo(
    () => new Map(types.map((type) => [type._id, type])),
    [types],
  );

  return { types, typesById, loading: loading && !data, error };
};

export const useStructureCapabilities = () => {
  const { data, loading, error } = useQuery<{
    structureCapabilities: IStructureCapability[];
  }>(STRUCTURE_CAPABILITIES);

  const capabilities = useMemo(() => data?.structureCapabilities ?? [], [data]);

  return { capabilities, loading, error };
};
