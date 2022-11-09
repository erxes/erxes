import React, { FC } from 'react';
import { useQuery } from 'react-apollo';
import { FORUM_SUBSCRIPTION_PRODUCTS_QUERY } from '../../graphql/queries';

const List: FC = () => {
  const { loading, error, data } = useQuery(FORUM_SUBSCRIPTION_PRODUCTS_QUERY, {
    variables: {
      sort: { listOrder: -1 }
    },
    fetchPolicy: 'network-only'
  });

  if (loading) return null;
  if (error) return <pre>{JSON.stringify(error, null, 2)}</pre>;

  return (
    <div>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>Multiplier</th>
            <th>Unit</th>
            <th>Price</th>
            <th>List order</th>
          </tr>
        </thead>
        <tbody>
          {data?.forumSubscriptionProducts.map((sp: any) => (
            <tr key={sp._id}>
              <td>{sp.name}</td>
              <td>{sp.description}</td>
              <td>{sp.multiplier}</td>
              <td>{sp.unit}</td>
              <td>{sp.price}</td>
              <td>{sp.listOrder}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default List;
