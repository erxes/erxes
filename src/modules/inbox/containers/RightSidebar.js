import React, { Component } from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { RightSidebar as RightSidebarComponent } from '../components';
import { queries as customerQueries } from 'modules/customers/graphql';
import client from 'apolloClient';

class RightSidebar extends Component {
  constructor(props) {
    super(props);

    this.state = { customer: {}, loading: false };
  }

  componentWillReceiveProps(props) {
    const { customerId, getCustomer, queryParams } = props;

    if (getCustomer) {
      this.setState({ loading: true });

      client
        .query({
          query: gql(customerQueries.generateCustomerDetailQuery(queryParams)),
          fetchPolicy: 'network-only',
          variables: { _id: customerId }
        })
        .then(({ data }) => {
          if (data && data.customerDetail) {
            this.setState({
              customer: data.customerDetail,
              loading: false
            });
          }
        })
        .catch(error => {
          console.log(error.message); //eslint-disable-line
        });
    }
  }

  render() {
    const { customer, loading } = this.state;

    const updatedProps = {
      ...this.props,
      customer,
      loading
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
  getCustomer: PropTypes.bool,
  queryParams: PropTypes.object
};

export default RightSidebar;
