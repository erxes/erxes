import React from 'react';
import gql from 'graphql-tag';
import { useQuery } from 'react-apollo';

const POSSIBLE_PARENTS = gql`
  query ForumCategoryPossibleParents($id: ID) {
    forumCategoryPossibleParents(_id: $id) {
      _id
      name
    }
  }
`;

const CategoryParentSelect: React.FC<{
  value: string;
  parentFor?: string;
  onChange: (any) => any;
}> = ({ value, parentFor, onChange }) => {
  const { data, loading, error } = useQuery(POSSIBLE_PARENTS, {
    variables: {
      id: parentFor
    }
  });

  if (loading) return null;
  if (error) <pre>{JSON.stringify(data, null, 2)}</pre>;

  const { forumCategoryPossibleParents } = data;

  return (
    <select value={value} onChange={e => onChange && onChange(e.target.value)}>
      <option key="null" value="">
        No parent (root category)
      </option>
      {forumCategoryPossibleParents.map(p => (
        <option key={p._id} value={p._id}>
          {p.name}
        </option>
      ))}
    </select>
  );
};

export default CategoryParentSelect;
