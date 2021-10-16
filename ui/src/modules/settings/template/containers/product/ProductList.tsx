import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import Bulk from 'modules/common/components/Bulk';
import { Alert, confirm, withProps } from 'modules/common/utils';
import { generatePaginationParams } from 'modules/common/utils/router';
import React from 'react';
import { graphql } from 'react-apollo';
import List from '../../components/product/ProductList';
import { queries, mutations } from '../../graphql';
import {
  ProductTemplateTotalCountQueryResponse,
  ProductTemplatesQueryResponse,
  ProductTemplatesChangeStatusMutionResponse,
  ProductTemplatesDuplicateMutionResponse,
  ProductTemplatesRemoveMutationResponse
} from '../../types';

import { PRODUCT_TEMPLATE_STATUSES } from '../../constants';

type Props = {
  queryParams: any;
  history: any;
  type?: string;
};

type FinalProps = {
  productTemplatesQuery: ProductTemplatesQueryResponse;
  productTemplateTotalCountQuery: ProductTemplateTotalCountQueryResponse;
} & Props &
  ProductTemplatesChangeStatusMutionResponse &
  ProductTemplatesDuplicateMutionResponse &
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
      queryParams,
      productTemplatesChangeStatus,
      productTemplatesDuplicate,
      productTemplatesRemove
    } = this.props;

    const products = productTemplatesQuery.productTemplates || [];

    const changeStatus = (_id: string, status: string) => {
      const isActive = status === PRODUCT_TEMPLATE_STATUSES.ACTIVE;
      const message = isActive ?
        "You are going to archive this product template. Are you sure?"
        : "You are going to active this product template. Are you sure?";

      const statusAction = isActive ? PRODUCT_TEMPLATE_STATUSES.ARCHIVED : PRODUCT_TEMPLATE_STATUSES.ACTIVE;

      confirm(message).then(() => {
        productTemplatesChangeStatus({ variables: { _id, status: statusAction } })
          .then(({ data }) => {
            const template = data.productTemplatesChangeStatus;

            if (template && template._id) {
              Alert.success(`Product template has been ${statusAction}.`);
            }
          })
          .catch((error: Error) => {
            Alert.error(error.message);
          });
      });
    };

    const duplicateTemplate = (_id: string) => {
      // const message = "You are going to duplicate this product template. Are you sure?";

      // confirm(message).then(() => {
      productTemplatesDuplicate({ variables: { _id } })
        .then(({ data }) => {
          const template = data.productTemplatesChangeStatus;

          if (template && template._id) {
            Alert.success(`Succesfully copied.`);
          }
        })
        .catch((error: Error) => {
          Alert.error(error.message);
        });
      // });
    };

    // remove action
    const remove = ({ ids }, emptyBulk) => {
      productTemplatesRemove({
        variables: { ids }
      })
        .then(removeStatus => {
          emptyBulk();

          const status = removeStatus.data.productTemplatesRemove || undefined;

          status
            ? Alert.success('You successfully deleted a product tempalte')
            : Alert.warning('You successfully deleted a product tempalte');
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
      loading: productTemplatesQuery.loading,
      searchValue,
      productsCount: productTemplateTotalCountQuery.productTemplateTotalCount || 0,
      changeStatus,
      duplicateTemplate,
      remove
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

const options = () => ({
  refetchQueries: [
    'productTemplates'
  ]
});

export default withProps<Props>(
  compose(
    graphql<Props, ProductTemplatesQueryResponse, { page: number; perPage: number }>(
      gql(queries.productTemplates),
      {
        name: 'productTemplatesQuery',
        options: ({ queryParams }) => ({
          variables: {
            tag: queryParams.tag,
            searchValue: queryParams.searchValue,
            status: queryParams.status,
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
    graphql<Props, ProductTemplatesRemoveMutationResponse, { ids: string[] }>(gql(mutations.productTemplatesRemove), {
      name: 'productTemplatesRemove',
      options
    }),
    graphql<Props, ProductTemplatesChangeStatusMutionResponse>(gql(mutations.productTemplatesChangeStatus),
      {
        name: 'productTemplatesChangeStatus',
        options
      }),
    graphql<Props, ProductTemplatesDuplicateMutionResponse>(gql(mutations.productTemplatesDuplicate),
      {
        name: 'productTemplatesDuplicate',
        options
      })
  )(ProductListContainer)
);
