import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import Bulk from 'modules/common/components/Bulk';
import { Alert, withProps } from 'modules/common/utils';
import { generatePaginationParams } from 'modules/common/utils/router';
import React from 'react';
import { graphql } from 'react-apollo';
import List from '../../components/product/ProductList';
import { mutations, queries } from '../../graphql';
import {
  ProductTemplatesRemoveMutationResponse,
  ProductTemplateTotalCountQueryResponse,
  ProductTemplatesQueryResponse
} from '../../types';

type Props = {
  queryParams: any;
  history: any;
  type?: string;
};

type FinalProps = {
  productTemplatesQuery: ProductTemplatesQueryResponse;
  productTemplateTotalCountQuery: ProductTemplateTotalCountQueryResponse;
} & Props &
  ProductTemplatesRemoveMutationResponse;

class ProductListContainer extends React.Component<FinalProps> {
  constructor(props) {
    super(props);

    this.state = {
      mergeProductLoading: false
    };
  }

  render() {
    const {
      productTemplatesQuery,
      productTemplateTotalCountQuery,
      productTemplatesRemove,
      queryParams
    } = this.props;

    const products = productTemplatesQuery.productTemplates || [];

    // remove action
    const remove = ({ ids }, emptyBulk) => {
      productTemplatesRemove({
        variables: { ids }
      })
        .then(removeStatus => {
          emptyBulk();

          const status = removeStatus.data.productsRemove;

          status === 'deleted'
            ? Alert.success('You successfully deleted a product')
            : Alert.warning('Product status deleted');
        })
        .catch(e => {
          Alert.error(e.message);
        });
    };

    const searchValue = this.props.queryParams.searchValue || '';

    const updatedProps = {
      ...this.props,
      queryParams,
      products,
      remove,
      loading: productTemplatesQuery.loading,
      searchValue,
      productsCount: productTemplateTotalCountQuery.productTemplateTotalCount || 0
    };

    const productList = props => {
      return <List {...updatedProps} {...props} />;
    };

    const refetch = () => {
      this.props.productTemplatesQuery.refetch();
    };

    return <Bulk content={productList} refetch={refetch} />;
  }
}

const getRefetchQueries = () => {
  return [
    'productTemplates'
  ];
};

const options = () => ({
  refetchQueries: getRefetchQueries()
});

export default withProps<Props>(
  compose(
    graphql<Props, ProductTemplatesQueryResponse, { page: number; perPage: number }>(
      gql(queries.productTemplates),
      {
        name: 'productTemplatesQuery',
        options: ({ queryParams }) => ({
          variables: {
            categoryId: queryParams.categoryId,
            tag: queryParams.tag,
            searchValue: queryParams.searchValue,
            type: queryParams.type,
            ...generatePaginationParams(queryParams)
          },
          fetchPolicy: 'network-only'
        })
      }
    ),
    graphql<Props, ProductTemplateTotalCountQueryResponse>(gql(queries.productTemplateTotalCount), {
      name: 'productTemplateTotalCountQuery',
      options: () => ({
        fetchPolicy: 'network-only'
      })
    }),
    graphql<Props, ProductTemplatesRemoveMutationResponse, { ids: string[] }>(
      gql(mutations.productTemplatesRemove),
      {
        name: 'productTemplatesRemove',
        options
      }
    )
  )(ProductListContainer)
);
