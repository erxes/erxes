import React from 'react';
import List from '../../components/productCategory/CategoryList';
import { queries } from '../../graphql';
import { withProps } from 'modules/common/utils';
import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { graphql } from 'react-apollo';
import {
  ProductTemplateTotalCountQueryResponse
} from '../../types';

type Props = { history: any; queryParams: any };

type FinalProps = {
  productTemplateTotalCountQuery: ProductTemplateTotalCountQueryResponse;
} & Props;
class ProductListContainer extends React.Component<FinalProps> {
  render() {

    const {
      productTemplateTotalCountQuery
    } = this.props;

    const types = {
      PRODUCTS_SERVICES: productTemplateTotalCountQuery.productTemplateTotalCount || 0
    };

    const updatedProps = {
      ...this.props,
      loading: productTemplateTotalCountQuery.loading,
      types
    };

    return <List {...updatedProps} />;
  }
}

// const getRefetchQueries = () => {
//   return ['productTemplateTotalCount'];
// };

// const options = () => ({
//   refetchQueries: getRefetchQueries()
// });

export default withProps<Props>(
  compose(
    graphql<Props, ProductTemplateTotalCountQueryResponse, {}>(
      gql(queries.productTemplateTotalCount),
      {
        name: 'productTemplateTotalCountQuery',
        options: () => ({
          fetchPolicy: 'network-only'
        })
      }
    )
  )(ProductListContainer)
);
