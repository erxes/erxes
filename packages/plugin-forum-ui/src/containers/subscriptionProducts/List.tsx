import * as compose from 'lodash.flowright';

import { Alert, confirm, withProps } from '@erxes/ui/src/utils';
import { mutations, queries } from '../../graphql';

import ButtonMutate from '@erxes/ui/src/components/ButtonMutate';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { IProduct } from '../../types';
import { IRouterProps } from '@erxes/ui/src/types';
import ProductList from '../../components/subscriptionProducts/ProductList';
import React from 'react';
import { RemoveMutationResponse } from '../../types';
import Spinner from '@erxes/ui/src/components/Spinner';
import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';
import { useQuery } from '@apollo/client';
import { withRouter } from 'react-router-dom';

type FinalProps = {
  queryParams: any;
  history?: any;
} & RemoveMutationResponse &
  IRouterProps;

function List({ removeMutation, queryParams, history }: FinalProps) {
  const userType = queryParams.userType || null;
  const { loading, error, data } = useQuery(
    gql(queries.forumSubscriptionProductsQuery),
    {
      variables: {
        sort: { listOrder: -1 },
        userType
      },
      fetchPolicy: 'network-only'
    }
  );

  if (loading) {
    return <Spinner objective={true} />;
  }

  if (error) {
    Alert.error(error.message);
  }

  const onDelete = (product: IProduct) => {
    confirm(`This will permanently delete ${product.name}, are you sure?`)
      .then(() => {
        removeMutation({ variables: { _id: product._id } }).catch(e => {
          Alert.error(e.message);
        });
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  const renderButton = ({
    name,
    values,
    isSubmitted,
    callback,
    object
  }: IButtonMutateProps) => {
    return (
      <ButtonMutate
        mutation={
          object._id ? mutations.updateProduct : mutations.createProduct
        }
        variables={values}
        callback={callback}
        refetchQueries={[
          {
            query: gql(queries.forumSubscriptionProductsQuery),
            variables: {
              sort: { listOrder: -1 },
              userType
            }
          }
        ]}
        isSubmitted={isSubmitted}
        type="submit"
        successMessage={`You successfully ${
          object._id ? 'updated' : 'added'
        } a ${name}`}
      />
    );
  };

  return (
    <ProductList
      queryParams={queryParams}
      onDelete={onDelete}
      history={history}
      renderButton={renderButton}
      products={data?.forumSubscriptionProducts}
    />
  );
}

export default withProps<{}>(
  compose(
    graphql<RemoveMutationResponse, { _id: string }>(
      gql(mutations.deleteSubscriptionProduct),
      {
        name: 'removeMutation',
        options: () => ({
          refetchQueries: ['ForumSubscriptionProducts']
        })
      }
    )
  )(withRouter<FinalProps>(List))
);
