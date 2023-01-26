import React from 'react';
import { useQuery, useMutation } from 'react-apollo';
import Form from '../../components/SubscriptionProductForm';
import { useParams, useHistory } from 'react-router-dom';
import gql from 'graphql-tag';

const PATCH = gql`
  mutation ForumPatchSubscriptionProduct(
    $id: ID!
    $description: String
    $listOrder: Float
    $multiplier: Float
    $name: String
    $price: Float
    $unit: ForumTimeDurationUnit
    $userType: String
  ) {
    forumPatchSubscriptionProduct(
      _id: $id
      description: $description
      listOrder: $listOrder
      multiplier: $multiplier
      name: $name
      price: $price
      unit: $unit
      userType: $userType
    ) {
      _id
    }
  }
`;

const QUERY = gql`
  query ForumSubscriptionProduct($id: ID!) {
    forumSubscriptionProduct(_id: $id) {
      _id
      description
      listOrder
      multiplier
      name
      price
      unit
      userType
    }
  }
`;

const SubscriptionProductEdit: React.FC = () => {
  const { id } = useParams();
  const history = useHistory();

  const { data, loading, error } = useQuery(QUERY, {
    variables: {
      id
    },
    fetchPolicy: 'network-only'
  });

  const [patchMut] = useMutation(PATCH, {
    onCompleted: () => {
      history.push(`/forums/subscription-products`);
    },
    onError: e => {
      alert(JSON.stringify(e, null, 2));
    },
    refetchQueries: ['ForumSubscriptionProducts', 'ForumSubscriptionProduct']
  });

  if (loading) return null;
  if (error) <pre>{JSON.stringify(error, null, 2)}</pre>;

  const onSubmit = async variables => {
    await patchMut({
      variables: {
        ...variables,
        id
      }
    });
  };

  return (
    <div>
      <h3>Edit permission group</h3>
      <Form
        subscriptionProduct={data.forumSubscriptionProduct}
        onSubmit={onSubmit}
      />
    </div>
  );
};

export default SubscriptionProductEdit;
