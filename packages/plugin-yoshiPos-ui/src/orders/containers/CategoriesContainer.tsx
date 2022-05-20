import { withRouter } from 'react-router-dom';
import React from 'react';
import queryString from 'query-string';

import {
  IRouterProps,
  IConfig,
  ProductCategoriesQueryResponse,
  ProductsQueryResponse
} from '../../../types';
import Spinner from 'modules/common/components/Spinner';
import withCurrentUser from 'modules/auth/containers/withCurrentUser';
import Categories from '../components/Categories';

type Props = {
  productCategoriesQuery: ProductCategoriesQueryResponse;
  productsQuery: ProductsQueryResponse;
  currentConfig: IConfig;
  orientation: string;
  mode: string;
} & IRouterProps;

class CategoriesContainer extends React.Component<Props> {
  render() {
    const { productCategoriesQuery, productsQuery, location } = this.props;

    if (productCategoriesQuery.loading || productsQuery.loading) {
      return <Spinner />;
    }

    const updatedProps = {
      ...this.props,
      productCategories: productCategoriesQuery.productCategories || [],
      products: productsQuery.products || [],
      qp: queryString.parse(location.search)
    };

    return <Categories {...updatedProps} />;
  }
}

export default withCurrentUser(
  withRouter<IRouterProps & Props>(CategoriesContainer)
);
