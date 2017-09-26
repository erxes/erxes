import React from 'react';
import PropTypes from 'prop-types';
import { compose, gql, graphql } from 'react-apollo';
import { KIND_CHOICES } from '/imports/api/integrations/constants';
import { pagination } from '/imports/react-ui/common';
import { queries } from '../graphql';
import { Sidebar } from '../components';

class CustomerListContainer extends React.Component {
  render() {
    const { queryParams, customersQuery, totalCountQuery } = this.props;

    const { totalCustomersCount } = totalCountQuery;
    const { loadMore, hasMore } = pagination(queryParams, totalCustomersCount);

    const updatedProps = {
      ...this.props,

      customers: customersQuery.customers || [],
      integrations: KIND_CHOICES.ALL_LIST,
      loadMore,
      hasMore,
    };

    return <Sidebar {...updatedProps} />;
  }
}

CustomerListContainer.propTypes = {
  customersQuery: PropTypes.object,
  totalCountQuery: PropTypes.object,
  queryParams: PropTypes.object,
};

export default compose(
  graphql(gql(queries.customers), {
    name: 'customersQuery',
    options: ({ queryParams }) => ({
      variables: {
        params: {
          ...queryParams,
          limit: queryParams.limit || 20,
        },
      },
    }),
  }),
  graphql(gql(queries.totalCustomersCount), { name: 'totalCountQuery' }),
)(CustomerListContainer);
