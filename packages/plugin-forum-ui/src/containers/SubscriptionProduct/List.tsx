import React, { FC } from 'react';
import { useQuery, useMutation } from 'react-apollo';
import { FORUM_SUBSCRIPTION_PRODUCTS_QUERY } from '../../graphql/queries';
import gql from 'graphql-tag';
import { useSearchParam } from '../../hooks';
import { Link } from 'react-router-dom';

const DELETE = gql`
  mutation ForumDeleteSubscriptionProduct($id: ID!) {
    forumDeleteSubscriptionProduct(_id: $id) {
      _id
    }
  }
`;

const List: FC = () => {
  const [userType, setUserType] = useSearchParam('userType');
  const { loading, error, data } = useQuery(FORUM_SUBSCRIPTION_PRODUCTS_QUERY, {
    variables: {
      sort: { listOrder: 1 },
      userType
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
      <div>
        User type:
        <select
          value={userType || ''}
          onChange={e => setUserType(e.target.value)}
        >
          <option value="">All</option>
          <option value="customer">Customer</option>
          <option value="company">Company</option>
        </select>
      </div>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>Multiplier</th>
            <th>Unit</th>
            <th>Price</th>
            <th>User type</th>
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
              <td>{sp.userType ? sp.userType : 'All'}</td>
              <td>{sp.listOrder}</td>
              <td>
                <Link to={`/forums/subscription-products/${sp._id}/edit`}>
                  Edit
                </Link>
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
