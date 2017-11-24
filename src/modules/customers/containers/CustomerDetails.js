import React from 'react';
import PropTypes from 'prop-types';
import { compose, gql, graphql } from 'react-apollo';
import { Spinner } from 'modules/common/components';
import { queries } from '../graphql';
import { CustomerDetails } from '../components';

const CustomerDetailsContainer = (props, context) => {
  const { customerDetailQuery, customerActivityLogQuery } = props;

  if (customerDetailQuery.loading || customerActivityLogQuery.loading) {
    return <Spinner />;
  }

  const updatedProps = {
    ...props,
    customer: {
      ...customerDetailQuery.customerDetail,
      refetch: customerDetailQuery.refetch
    },
    activityLogsCustomer: customerActivityLogQuery.activityLogsCustomer,
    currentUser: context.currentUser
  };

  return <CustomerDetails {...updatedProps} />;
};

CustomerDetailsContainer.propTypes = {
  id: PropTypes.string,
  customerDetailQuery: PropTypes.object,
  customerActivityLogQuery: PropTypes.object
};

CustomerDetailsContainer.contextTypes = {
  currentUser: PropTypes.object
};

export default compose(
  graphql(gql(queries.customerDetail), {
    name: 'customerDetailQuery',
    options: ({ id }) => ({
      variables: {
        _id: id
      }
    })
  }),
  graphql(gql(queries.activityLogsCustomer), {
    name: 'customerActivityLogQuery',
    options: ({ id }) => ({
      variables: {
        _id: id
      }
    })
  })
)(CustomerDetailsContainer);
