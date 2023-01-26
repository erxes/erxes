import React from 'react';
import { useQuery } from 'react-apollo';
import gql from 'graphql-tag';
import { queries } from '../graphql';

const CategorySelect: React.FC<{
  value: string;
  onChange: (any) => any;
}> = ({ value, onChange }) => {
  const { data, loading, error } = useQuery(gql(queries.categoriesAll), {
    fetchPolicy: 'network-only'
  });

  if (loading) return null;
  if (error) return <pre>{JSON.stringify(error, null, 2)}</pre>;

  const { forumCategories } = data;

  return (
    <select value={value} onChange={e => onChange && onChange(e.target.value)}>
      <option key="null" value="">
        No category
      </option>
      {forumCategories.map(p => (
        <option key={p._id} value={p._id}>
          {p.name}
        </option>
      ))}
    </select>
  );
};

export default CategorySelect;
