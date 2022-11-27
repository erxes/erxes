import { Alert, confirm, withProps } from '@erxes/ui/src';
import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from 'react-apollo';

import List from '../../components/carCategory/CategoryList';
import { mutations, queries } from '../../graphql';
import {
  CarCategoriesCountQueryResponse,
  CarCategoriesQueryResponse,
  CarCategoryRemoveMutationResponse
} from '../../types';

type Props = { history: any; queryParams: any };

type FinalProps = {
  carCategoriesQuery: CarCategoriesQueryResponse;
  carCategoriesCountQuery: CarCategoriesCountQueryResponse;
} & Props &
  CarCategoryRemoveMutationResponse;

class CarListContainer extends React.Component<FinalProps> {
  render() {
    const {
      carCategoriesQuery,
      carCategoriesCountQuery,
      carCategoryRemove
    } = this.props;

    const remove = carId => {
      confirm().then(() => {
        carCategoryRemove({
          variables: { _id: carId }
        })
          .then(() => {
            carCategoriesQuery.refetch();
            carCategoriesCountQuery.refetch();

            Alert.success(`You successfully deleted a car & service category`);
          })
          .catch(error => {
            Alert.error(error.message);
          });
      });
    };

    const carCategories = carCategoriesQuery.carCategories || [];

    const updatedProps = {
      ...this.props,
      remove,
      refetch: carCategoriesQuery.refetch,
      carCategories,
      loading: carCategoriesQuery.loading,
      carCategoriesCount: carCategoriesCountQuery.carCategoriesTotalCount || 0
    };

    return <List {...updatedProps} />;
  }
}

const getRefetchQueries = () => {
  return ['carCategories', 'carCategoriesTotalCount'];
};

const options = () => ({
  refetchQueries: getRefetchQueries()
});

export default withProps<Props>(
  compose(
    graphql<Props, CarCategoriesQueryResponse, { parentId: string }>(
      gql(queries.carCategories),
      {
        name: 'carCategoriesQuery',
        options: {
          fetchPolicy: 'network-only'
        }
      }
    ),
    graphql<Props, CarCategoriesCountQueryResponse>(
      gql(queries.carCategoriesCount),
      {
        name: 'carCategoriesCountQuery'
      }
    ),
    graphql<Props, CarCategoryRemoveMutationResponse, { _id: string }>(
      gql(mutations.carCategoryRemove),
      {
        name: 'carCategoryRemove',
        options
      }
    )
  )(CarListContainer)
);
