import React, { PropTypes } from 'react';
import { compose, gql, graphql } from 'react-apollo';
import { CustomerDetails } from '../components';
import { queries } from '../graphql';

const CustomerDetailsContainer = props => {
  const { customerDetailQuery } = props;

  if (customerDetailQuery.loading) {
    return null;
  }

  const updatedProps = {
    ...props,
    customer: {
      ...customerDetailQuery.customerDetail,
      refetch: customerDetailQuery.refetch,
    },
  };

  return <CustomerDetails {...updatedProps} />;
};

CustomerDetailsContainer.propTypes = {
  customerDetailQuery: PropTypes.object,
};

export default compose(
  graphql(gql(queries.customerDetail), {
    name: 'customerDetailQuery',
    options: ({ id }) => ({
      variables: {
        _id: id,
      },
    }),
  }),
)(CustomerDetailsContainer);
