import { withProps, Spinner, Alert } from 'erxes-ui';
import React from 'react';
import MatchForm from '../components/matchForm/MatchCarForm';
import { mutations, queries } from '../graphql';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import * as compose from 'lodash.flowright';
import {
  ICarCategory,
  CarCategoriesQueryResponse,
  ProductMatchQueryResponse,
  IProduct,
  ProductMatchMutationResponse,
  ProductMatchMutationVariables
} from '../types';

type Props = {
  car: ICarCategory;
  carCategories: ICarCategory[];
  product: IProduct;
  closeModal: () => void;
  remove: (productCategoryId: string) => void;
  saveMatch: (carCategoryIds: any) => void;
};

type FinalProps = {
  carCategoriesQuery: CarCategoriesQueryResponse;
  productMatchQuery: ProductMatchQueryResponse;
} & Props &
  ProductMatchMutationResponse;

class MatchCarFormContainer extends React.Component<FinalProps> {
  saveMatch = (carCategoryIds: any) => {
    this.props
      .editMatch({
        variables: { productId: this.props.product._id, carCategoryIds }
      })
      .then(() => {
        Alert.success('You successfully added a carCategories');
      })
      .catch(error => {
        Alert.error(error.message);
      });
  };

  render() {
    const { carCategoriesQuery, productMatchQuery } = this.props;

    if (carCategoriesQuery.loading || productMatchQuery.loading) {
      return <Spinner />;
    }

    const carCategories = carCategoriesQuery.carCategories || [];

    const updatedProps = {
      ...this.props,
      saveMatch: this.saveMatch,
      carCategories,
      carCategoryIds:
        productMatchQuery.productMatchCarCategories.carCategoryIds || []
    };

    return <MatchForm {...updatedProps} />;
  }
}

const getRefetchQueries = () => {
  return [
    'carCategories',
    'carCategoriesTotalCount',
    'productCategories',
    'productCategoriesTotalCount',
    'products'
  ];
};

export default withProps<FinalProps>(
  compose(
    graphql<{}, ProductMatchMutationResponse, ProductMatchMutationVariables>(
      gql(mutations.productMatch),
      {
        name: 'editMatch',
        options: {
          refetchQueries: ['productMatchCarCategories']
        }
      }
    ),
    graphql<Props, CarCategoriesQueryResponse>(gql(queries.carCategories), {
      name: 'carCategoriesQuery'
    }),
    graphql<Props, ProductMatchQueryResponse, {}>(
      gql(queries.productMatchCarCategories),
      {
        name: 'productMatchQuery',
        options: ({ product }) => ({
          variables: { productId: product._id },
          fetchPolicy: 'network-only'
        })
      }
    )
  )(MatchCarFormContainer)
);
