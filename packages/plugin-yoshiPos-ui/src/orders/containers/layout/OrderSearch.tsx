import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import React from 'react';
import { withRouter } from 'react-router-dom';
import { graphql } from 'react-apollo';
import queryString from 'query-string';

import { queries } from '../../graphql/index';
import SearchInput from '../../../orders/components/SearchInput';
import OrderItem from '../../../orders/components/drawer/OrderItem';
import { BackButton, FlexCustomer, Orders } from '../../../orders/styles';
import { withProps, router, __ } from '../../../common/utils';
import { OrderQueryResponse } from '../../../orders/types';
import { IRouterProps } from '../../../types';
import Spinner from '../../../common/components/Spinner';
import Icon from '../../../common/components/Icon';

type Props = {
  orientation: string;
  onChange: (type: string) => void;
};

type WithProps = {
  history: any;
  queryParams: any;
};

type FinalProps = {
  ordersQuery: OrderQueryResponse;
} & Props &
  WithProps;

class SearchContainer extends React.Component<FinalProps> {
  clearSearch = () => {
    router.setParams(this.props.history, { orderSearch: '' });
  };

  onSearch = e => {
    if (e.key === 'Enter') {
      e.preventDefault();

      const searchValue = e.currentTarget.value;

      router.setParams(this.props.history, { orderSearch: searchValue });
    }
  };

  renderContent() {
    const { ordersQuery, orientation } = this.props;

    if (ordersQuery.loading) {
      return <Spinner />;
    }

    return ordersQuery.orders.map(order => (
      <OrderItem orientation={orientation} key={order._id} order={order} />
    ));
  }

  render() {
    return (
      <>
        <FlexCustomer>
          <BackButton onClick={() => this.props.onChange('product')}>
            <Icon icon="leftarrow-3" />
            {__('Cancel')}
          </BackButton>
          <SearchInput
            onSearch={this.onSearch}
            clearSearch={this.clearSearch}
            placeholder="Search"
          />
        </FlexCustomer>
        <Orders>{this.renderContent()}</Orders>
      </>
    );
  }
}

const WithSearchContainer = withProps<WithProps>(
  compose(
    graphql<WithProps, OrderQueryResponse>(gql(queries.orders), {
      name: 'ordersQuery',
      options: ({ queryParams }: { queryParams: any }) => ({
        variables: { searchValue: queryParams.orderSearch }
      })
    })
  )(SearchContainer)
);

const WithQueryParams = (props: IRouterProps & Props) => {
  const { location } = props;
  const queryParams = queryString.parse(location.search);

  const extendedProps = { ...props, queryParams };

  return <WithSearchContainer {...extendedProps} />;
};

export default withRouter<IRouterProps & Props>(WithQueryParams);
