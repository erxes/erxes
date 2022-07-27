import { Alert, Spinner, withProps } from '@erxes/ui/src';
import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from 'react-apollo';
import { withRouter } from 'react-router-dom';

import MatchCategoryForm from '../components/matchForm/MatchCategoryForm';
import { mutations, queries } from '../graphql';
import {
  CarCategoryMatchMutationResponse,
  CarCategoryMatchMutationVariables,
  CarCategoryMatchQueryResponse,
  ICarCategory,
  IProductCategory,
  IRouterProps,
  ProductCategoriesQueryResponse
} from '../types';

type Props = {
  carCategory: ICarCategory;
  productCategory: IProductCategory;
  productCategories: IProductCategory[];
  closeModal: () => void;
};

type FinalProps = {
  carCategoryMatchQuery: CarCategoryMatchQueryResponse;
  productCategoriesQuery: ProductCategoriesQueryResponse;
} & Props &
  IRouterProps &
  CarCategoryMatchMutationResponse;

class CategoryFormContainer extends React.Component<FinalProps> {
  constructor(props) {
    super(props);
  }

  saveMatch = (productCategoryIds: string[]) => {
    this.props
      .editMatch({
        variables: {
          carCategoryId: this.props.carCategory._id,
          productCategoryIds
        }
      })
      .then(() => {
        Alert.success('You successfully added a product category');
      })
      .catch(error => {
        Alert.error(error.message);
      });
  };

  render() {
    const { carCategoryMatchQuery, productCategoriesQuery } = this.props;

    if (carCategoryMatchQuery.loading || productCategoriesQuery.loading) {
      return <Spinner />;
    }

    const productCategories = productCategoriesQuery.productCategories || [];

    const extendedProps = {
      ...this.props,
      productCategories,
      productCategoryIds:
        (carCategoryMatchQuery &&
          carCategoryMatchQuery.carCategoryMatchProducts &&
          carCategoryMatchQuery.carCategoryMatchProducts.productCategoryIds) ||
        [],
      saveMatch: this.saveMatch
    };

    return <MatchCategoryForm {...extendedProps} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props, CarCategoryMatchQueryResponse, {}>(
      gql(queries.carCategoryMatchProducts),
      {
        name: 'carCategoryMatchQuery',
        options: ({ carCategory }) => ({
          variables: { carCategoryId: carCategory._id },
          fetchPolicy: 'network-only'
        })
      }
    ),
    graphql<Props, ProductCategoriesQueryResponse>(
      gql(queries.productCategories),
      {
        name: 'productCategoriesQuery'
      }
    ),
    graphql<
      {},
      CarCategoryMatchMutationResponse,
      CarCategoryMatchMutationVariables
    >(gql(mutations.carCategoryMatch), {
      name: 'editMatch',
      options: {
        refetchQueries: ['carCategoryMatchProducts']
      }
    })
  )(withRouter<IRouterProps>(CategoryFormContainer))
);
