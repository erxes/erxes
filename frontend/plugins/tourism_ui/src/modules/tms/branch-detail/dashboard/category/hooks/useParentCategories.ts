import { QueryHookOptions, useQuery } from '@apollo/client';
import { GET_PARENT_CATEGORIES } from '../graphql/queries';

interface IAttachment {
  url?: string;
  name?: string;
  type?: string;
  size?: number;
  duration?: number;
}

type ParentCategory = {
  _id: string;
  name?: string;
  parentId?: string;
  attachment?: IAttachment;
};

type ParentCategoriesQueryVariables = {
  branchId?: string;
  language?: string;
};

export const useParentCategories = (
  options?: QueryHookOptions<
    {
      bmsTourCategories: ParentCategory[];
    },
    ParentCategoriesQueryVariables
  >,
) => {
  const { data, loading } = useQuery(GET_PARENT_CATEGORIES, {
    ...options,
    fetchPolicy: 'no-cache',
  });

  const categories = data?.bmsTourCategories || [];

  return {
    loading,
    categories,
  };
};
