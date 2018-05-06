import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { RightSidebar as RightSidebarComponent } from '../components';
import { queries as customerQueries } from 'modules/customers/graphql';

class RightSidebar extends Component {
  render() {
    const { customerDetailQuery } = this.props;
    const { customerDetail, loading = false } = customerDetailQuery || {};

    const customer = customerDetail || {};

    const updatedProps = {
      ...this.props,
      customer,
      loading: loading
    };

    return <RightSidebarComponent {...updatedProps} />;
  }
}

RightSidebar.propTypes = {
  customerDetailQuery: PropTypes.object,
  customerId: PropTypes.string.isRequired,
  conversation: PropTypes.object.isRequired,
  refetch: PropTypes.func,
  showSectionContent: PropTypes.func,
  getCustomer: PropTypes.bool
};

export default compose(
  graphql(gql(customerQueries.customerDetail), {
    name: 'customerDetailQuery',
    options: ({ customerId, getCustomer }) => ({
      skip: !getCustomer,
      variables: { _id: customerId }
    })
  })
)(RightSidebar);
