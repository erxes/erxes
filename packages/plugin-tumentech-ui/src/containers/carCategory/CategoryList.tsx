import { Alert, confirm, withProps, ButtonMutate } from '@erxes/ui/src';
import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from 'react-apollo';

import List from '../../components/carCategory/CategoryList';
import { mutations, queries } from '../../graphql';
import {
  CarCategoriesCountQueryResponse,
  CarCategoriesQueryResponse,
  CarCategoryRemoveMutationResponse,
  IProduct,
  IProductCategory,
  ProductCategoriesQueryResponse
} from '../../types';
import { IButtonMutateProps } from '@erxes/ui/src/types';

type Props = {
  history: any;
  queryParams: any;
  productCategories: IProductCategory[];
  renderButton: (props: IButtonMutateProps) => JSX.Element;

  products: IProduct[];
  saveMatch: () => void;
};

type FinalProps = {
  carCategoriesQuery: CarCategoriesQueryResponse;
  carCategoriesCountQuery: CarCategoriesCountQueryResponse;
  productCategoriesQuery: ProductCategoriesQueryResponse;
} & Props &
  CarCategoryRemoveMutationResponse;

class CarListContainer extends React.Component<FinalProps> {
  render() {
    const {
      carCategoriesQuery,
      carCategoriesCountQuery,
      carCategoryRemove,
      productCategoriesQuery,
      saveMatch
    } = this.props;

    const renderButton = ({
      name,
      values,
      isSubmitted,
      callback,
      object
    }: IButtonMutateProps) => {
      const attachment = values.attachment || undefined;

      values.attachment = attachment
        ? { ...attachment, __typename: undefined }
        : null;

      return (
        <ButtonMutate
          mutation={object}
          variables={object}
          callback={callback}
          refetchQueries={getRefetchQueries()}
          isSubmitted={isSubmitted}
          type="submit"
          uppercase={false}
          successMessage={`You successfully ${
            object ? 'updated' : 'added'
          } a ${name}`}
        />
      );
    };

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
    const productCategories = productCategoriesQuery.productCategories || [];

    const updatedProps = {
      ...this.props,
      remove,
      renderButton,
      refetch: carCategoriesQuery.refetch,
      carCategories,
      loading: carCategoriesQuery.loading,
      carCategoriesCount: carCategoriesCountQuery.carCategoriesTotalCount || 0,
      productCategories,
      saveMatch
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
    ),
    graphql<Props, ProductCategoriesQueryResponse>(
      gql(queries.productCategories),
      {
        name: 'productCategoriesQuery'
      }
    )
  )(CarListContainer)
);
