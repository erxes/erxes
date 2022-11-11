import React, { FC } from 'react';
import SubscriptionProductForm from '../../components/SubscriptionProductForm';
import gql from 'graphql-tag';
import { useMutation } from 'react-apollo';
import { useParams, Link, useHistory } from 'react-router-dom';

const CREATE_NEW = gql`
  mutation ForumCreateSubscriptionProduct(
    $multiplier: Float!
    $price: Float!
    $unit: ForumTimeDurationUnit!
    $description: String
    $listOrder: Float
    $name: String
  ) {
    forumCreateSubscriptionProduct(
      multiplier: $multiplier
      price: $price
      unit: $unit
      description: $description
      listOrder: $listOrder
      name: $name
    ) {
      _id
    }
  }
`;

const NewSubscriptionProduct: FC = () => {
  const [createNew] = useMutation(CREATE_NEW, {
    refetchQueries: ['ForumSubscriptionProducts'],
    onError: e => console.error(e)
  });

  const history = useHistory();

  const onSubmit = async val => {
    await createNew({ variables: val });
    history.push('/forums/subscription-products');
  };
  return (
    <div>
      <h1>Create new subscription product</h1>

      <SubscriptionProductForm onSubmit={onSubmit} />
    </div>
  );
};

export default NewSubscriptionProduct;
