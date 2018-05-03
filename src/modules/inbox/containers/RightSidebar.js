import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { RightSidebar as RightSidebarComponent } from '../components';
import { queries as customerQueries } from 'modules/customers/graphql';

class RightSidebar extends Component {
  render() {
    const { customerDetailQuery } = this.props;

    const customer = customerDetailQuery.customerDetail;

    const updatedProps = {
      ...this.props,
      customer,
      loading: customerDetailQuery.loading
    };

    return <RightSidebarComponent {...updatedProps} />;
  }
}

RightSidebar.propTypes = {
  customerDetailQuery: PropTypes.object,
  customerId: PropTypes.string.isRequired,
  conversation: PropTypes.object.isRequired,
  refetch: PropTypes.func
};

export default compose(
  graphql(gql(customerQueries.customerDetail), {
    name: 'customerDetailQuery',
    options: ({ customerId }) => ({
      variables: { _id: customerId }
    })
  })
)(RightSidebar);
