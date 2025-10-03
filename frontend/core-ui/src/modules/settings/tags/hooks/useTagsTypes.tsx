import { useQuery } from '@apollo/client';
import React from 'react';
import { GET_TAGS_TYPES } from '../graphql/queries/tagsQueries';

export const useTagsTypes = () => {
  const { data, error, loading } = useQuery(GET_TAGS_TYPES);
  const tagsGetTypes = data?.tagsGetTypes || [];
  return {
    tagsGetTypes,
    error,
    loading,
  };
};
