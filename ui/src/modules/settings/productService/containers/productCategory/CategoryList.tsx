import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { Alert, confirm, withProps, router as routerUtils } from 'modules/common/utils';
import React from 'react';
import { graphql } from 'react-apollo';
import List from '../../components/productCategory/CategoryList';
import { mutations, queries } from '../../graphql';
import {
  ProductCategoriesCountQueryResponse,
  ProductCategoriesQueryResponse,
  ProductCategoryRemoveMutationResponse
} from '../../types';
import queryString from 'query-string';

type Props = { history: any; queryParams: any };

type FinalProps = {
  productCategoriesQuery: ProductCategoriesQueryResponse;
  productCategoriesCountQuery: ProductCategoriesCountQueryResponse;
} & Props &
  ProductCategoryRemoveMutationResponse;

const generateQueryParams = ({ location }) => {
  return queryString.parse(location.search);
};

class ProductListContainer extends React.Component<FinalProps> {
  render() {
    const {
      productCategoriesQuery,
      productCategoriesCountQuery,
      productCategoryRemove
    } = this.props;

    const remove = productId => {
      confirm().then(() => {
        productCategoryRemove({
          variables: { _id: productId }
        })
          .then(() => {
            productCategoriesQuery.refetch();
            productCategoriesCountQuery.refetch();

            Alert.success(
              `You successfully deleted a product & service category`
            );
          })
          .catch(error => {
            Alert.error(error.message);
          });
      });
    };

    const onSelect = (values: string[] | string, key: string) => {
      const params = generateQueryParams(this.props.history);

      if (params[key] === values) {
        return routerUtils.removeParams(this.props.history, key);
      }

      return routerUtils.setParams(this.props.history, { [key]: values });
    };

    const productCategories = productCategoriesQuery.productCategories || [];

    const updatedProps = {
      ...this.props,
      remove,
      refetch: getRefetchQueries,
      productCategories,
      onSelect,
      loading: productCategoriesQuery.loading,
      productCategoriesCount:
        productCategoriesCountQuery.productCategoriesTotalCount || 0
    };

    return <List {...updatedProps} />;
  }
}

const getRefetchQueries = () => {
  return ['productCategories', 'productCategoriesTotalCount', 'products'];
};

const options = () => ({
  refetchQueries: getRefetchQueries()
});

export default withProps<Props>(
  compose(
    graphql<Props, ProductCategoriesQueryResponse, { parentId: string }>(
      gql(queries.productCategories),
      {
        name: 'productCategoriesQuery',
        options: ({ queryParams }) => ({
          variables: {
            status: queryParams.status,
            parentId: queryParams.parentId
          },
          refetchQueries: getRefetchQueries(),
          fetchPolicy: 'network-only'
        })
      }
    ),
    graphql<Props, ProductCategoriesCountQueryResponse>(
      gql(queries.productCategoriesCount),
      {
        name: 'productCategoriesCountQuery'
      }
    ),
    graphql<Props, ProductCategoryRemoveMutationResponse, { _id: string }>(
      gql(mutations.productCategoryRemove),
      {
        name: 'productCategoryRemove',
        options
      }
    )
  )(ProductListContainer)
);
