import { Meteor } from 'meteor/meteor';
import React from 'react';
import PropTypes from 'prop-types';
import { compose, gql, graphql } from 'react-apollo';
import { Loading } from '/imports/react-ui/common';
import { Customers } from '/imports/api/customers/customers';
import { KIND_CHOICES } from '/imports/api/integrations/constants';
import { TAG_TYPES } from '/imports/api/tags/constants';
import { Bulk, pagination } from '/imports/react-ui/common';
import { queries } from '../graphql';
import { CustomersList } from '../components';

class CustomerListContainer extends Bulk {
  render() {
    const {
      queryParams,
      customersQuery,
      totalCountQuery,
      segmentsQuery,
      brandsQuery,
      tagsQuery,
      customerCountsQuery,
    } = this.props;

    if (
      customersQuery.loading ||
      totalCountQuery.loading ||
      segmentsQuery.loading ||
      brandsQuery.loading ||
      customerCountsQuery.loading ||
      tagsQuery.loading
    ) {
      return <Loading title="Customers" />;
    }

    const { totalCustomersCount } = totalCountQuery;
    const { loadMore, hasMore } = pagination(queryParams, totalCustomersCount);

    const updatedProps = {
      ...this.props,
      // If there's no customer fields config, all fields will be selected
      customerFields: (Meteor.user() &&
        Meteor.user().configs &&
        Meteor.user().configs.customerFields) ||
        Customers.getPublicFields(),

      customers: customersQuery.customers,
      counts: customerCountsQuery.customerCounts,
      segments: segmentsQuery.segments,
      brands: brandsQuery.brands,
      integrations: KIND_CHOICES.ALL_LIST,
      tags: tagsQuery.tags,
      loadMore,
      hasMore,
      bulk: this.state.bulk,
      toggleBulk: this.toggleBulk,
    };

    return <CustomersList {...updatedProps} />;
  }
}

CustomerListContainer.propTypes = {
  customersQuery: PropTypes.object,
  segmentsQuery: PropTypes.object,
  tagsQuery: PropTypes.object,
  brandsQuery: PropTypes.object,
  totalCountQuery: PropTypes.object,
  customerCountsQuery: PropTypes.object,
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
  graphql(gql(queries.customerCounts), {
    name: 'customerCountsQuery',
    options: ({ queryParams }) => ({
      variables: {
        params: {
          ...queryParams,
          limit: queryParams.limit || 20,
        },
      },
    }),
  }),
  graphql(gql(queries.segments), { name: 'segmentsQuery' }),
  graphql(gql(queries.tags), {
    name: 'tagsQuery',
    options: () => ({
      variables: {
        type: TAG_TYPES.CUSTOMER,
      },
    }),
  }),
  graphql(gql(queries.brands), { name: 'brandsQuery' }),
  graphql(gql(queries.totalCustomersCount), { name: 'totalCountQuery' }),
)(CustomerListContainer);
