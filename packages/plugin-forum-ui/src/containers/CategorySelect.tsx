import React from 'react';
import gql from 'graphql-tag';
import { useQuery } from 'react-apollo';

const ALL_CATEGORIES = gql`
  query ForumCategoriesAll {
    forumCategories {
      _id
      code
      name
    }
  }
`;

const CategorySelect: React.FC<{
  value: string;
  except?: string;
  onChange: (any) => any;
}> = ({ value, except, onChange }) => {
  const { data, loading, error } = useQuery(ALL_CATEGORIES);

  if (loading) return null;
  if (error) <pre>{JSON.stringify(data, null, 2)}</pre>;

  const possibleParents = !except
    ? data.forumCategories
    : data.forumCategories.filter(c => except !== c._id);

  return (
    <select value={value} onChange={e => onChange && onChange(e.target.value)}>
      <option key="null" value="">
        No parent (root category)
      </option>
      {possibleParents.map(p => (
        <option key={p._id} value={p._id}>
          {p.name}
        </option>
      ))}
    </select>
  );
};

export default CategorySelect;
