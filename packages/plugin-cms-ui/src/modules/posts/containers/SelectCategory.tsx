import React from 'react';
import { useQuery, useLazyQuery } from '@apollo/client';
import SelectCategory from '../components/SelectCategory';
import queries from '../../categories/graphql/queries';

type Props = {
  value: string | string[];
  onChange: (category: any) => void;
};

const Container = (props: Props) => {
  const { value, onChange } = props;
  const [getTags, { data, loading }] = useLazyQuery(queries.GET_CATEGORIES, {
    fetchPolicy: 'network-only',
    variables: {
      searchValue: '',
    },
  });

  const categoriesQuery = useQuery(queries.GET_CATEGORIES, {
    variables: {
      searchValue: '',
    },
  });

  const onSearch = (searchValue: string) => {
    getTags({
      variables: {
        searchValue,
      },
    });
  };

  const categories = (data && data.cmsCategories) || [];
  const allCategories =
    (categoriesQuery.data && categoriesQuery.data.cmsCategories) || [];

  return (
    <SelectCategory
      allCategories={allCategories as any[]}
      filtered={categories as any[]}
      value={value}
      loading={loading}
      onSearch={onSearch}
      onChange={onChange}
    />
  );
};

export default Container;
