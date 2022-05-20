import { withRouter } from 'react-router-dom';
import React from 'react';
import queryString from 'query-string';

import { IRouterProps, IConfig, ProductsQueryResponse } from '../../types';
import { IOrderItemInput } from '../types';
import Products from '../components/Products';
import Spinner from '../../common/components/Spinner';
import withCurrentUser from '../../auth/containers/withCurrentUser';

type Props = {
  productsQuery: ProductsQueryResponse;
  setItems: (items: IOrderItemInput[]) => void;
  items: IOrderItemInput[];
  currentConfig: IConfig;
  orientation: string;
} & IRouterProps;

class ProductsContainer extends React.Component<Props> {
  render() {
    const { productsQuery, location } = this.props;

    if (productsQuery.loading) {
      return <Spinner />;
    }

    const updatedProps = {
      ...this.props,
      products: productsQuery.products || [],
      qp: queryString.parse(location.search)
    };

    return <Products {...updatedProps} />;
  }
}

export default withCurrentUser(
  withRouter<IRouterProps & Props>(ProductsContainer)
);
