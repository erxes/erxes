import React from 'react';
import { useQuery } from 'react-apollo';
import gql from 'graphql-tag';
import NeighborFormItem from '../components/NeighorFormItem';
import queries from '../graphql/queries';

function NeighborFormContainer({ type, itemData, onChange }) {
  const itemsQuery = useQuery(gql(queries.getNeighborItems), {
    variables: { type: type.type }
  });

  if (itemsQuery.loading) {
    return <div>...</div>;
  }

  if (itemsQuery.error) {
    return <div>{itemsQuery.error.message}</div>;
  }

  return (
    <NeighborFormItem
      itemData={itemData}
      onChange={onChange}
      type={type}
      options={itemsQuery.data.getNeighborItems}
    />
  );
}

export default NeighborFormContainer;
