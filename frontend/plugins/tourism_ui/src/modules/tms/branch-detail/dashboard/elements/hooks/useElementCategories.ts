import { useQuery } from '@apollo/client';
import { useMemo } from 'react';
import { GET_ELEMENT_CATEGORIES } from '../graphql/categoryQueries';
import { compactList } from '~/utils/cursorList';

export const useElementCategories = () => {
  const { data, loading } = useQuery(GET_ELEMENT_CATEGORIES);

  const categories = useMemo(
    () => compactList(data?.bmsElementCategories),
    [data?.bmsElementCategories],
  );

  const getCategoryNameById = (id: string): string => {
    const category = categories.find((cat) => cat._id === id);
    return category?.name || id;
  };

  const getCategoryNamesByIds = (ids: string[]): string[] => {
    return ids.map((id) => getCategoryNameById(id));
  };

  return {
    categories,
    loading,
    getCategoryNameById,
    getCategoryNamesByIds,
  };
};
