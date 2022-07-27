import { Alert, Spinner, withProps } from '@erxes/ui/src';
import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from 'react-apollo';

import MatchForm from '../components/matchForm/MatchCarForm';
import { mutations, queries } from '../graphql';
import {
  CarCategoriesQueryResponse,
  ICarCategory,
  IProductCategory,
  ProductMatchMutationResponse,
  ProductMatchMutationVariables,
  ProductMatchQueryResponse
} from '../types';

type Props = {
  car: ICarCategory;
  carCategories: ICarCategory[];
  productCategory: IProductCategory;
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
        variables: {
          productCategoryId: this.props.productCategory._id,
          carCategoryIds
        }
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
        (productMatchQuery &&
          productMatchQuery.productMatchCarCategories &&
          productMatchQuery.productMatchCarCategories.carCategoryIds) ||
        []
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
          refetchQueries: ['productCategoryMatchCarCategories']
        }
      }
    ),
    graphql<Props, CarCategoriesQueryResponse>(gql(queries.carCategories), {
      name: 'carCategoriesQuery'
    }),
    graphql<Props, ProductMatchQueryResponse, {}>(
      gql(queries.productCategoryMatchCarCategories),
      {
        name: 'productMatchQuery',
        options: ({ productCategory }) => ({
          variables: { productCategoryId: productCategory._id },
          fetchPolicy: 'network-only'
        })
      }
    )
  )(MatchCarFormContainer)
);
