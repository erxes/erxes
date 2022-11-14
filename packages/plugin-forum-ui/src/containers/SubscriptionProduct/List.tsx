import React, { FC } from 'react';
import { useQuery, useMutation } from 'react-apollo';
import { FORUM_SUBSCRIPTION_PRODUCTS_QUERY } from '../../graphql/queries';
import gql from 'graphql-tag';

const DELETE = gql`
  mutation ForumDeleteSubscriptionProduct($id: ID!) {
    forumDeleteSubscriptionProduct(_id: $id) {
      _id
    }
  }
`;

const List: FC = () => {
  const { loading, error, data } = useQuery(FORUM_SUBSCRIPTION_PRODUCTS_QUERY, {
    variables: {
      sort: { listOrder: -1 }
    },
    fetchPolicy: 'network-only'
  });

  const [mutDelete] = useMutation(DELETE, {
    refetchQueries: ['ForumSubscriptionProducts']
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
            <th></th>
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
              <td>
                <button
                  type="button"
                  onClick={async () => {
                    await mutDelete({
                      variables: {
                        id: sp._id
                      }
                    });
                  }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default List;
