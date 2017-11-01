import React from 'react';
import PropTypes from 'prop-types';
import { compose, gql, graphql } from 'react-apollo';
import { Alert } from 'modules/common/utils';
import { Loading } from 'modules/common/components';
import { withCurrentUser } from 'modules/auth/containers';
import { queries, mutations } from '../graphql';
import { CustomerDetails } from '../components';

const CustomerDetailsContainer = props => {
  const {
    id,
    customerDetailQuery,
    customersEdit,
    customersAddCompany,
    fieldsQuery
  } = props;

  if (customerDetailQuery.loading || fieldsQuery.loading) {
    return (
      <Loading title="Customers" sidebarSize="wide" spin hasRightSidebar />
    );
  }

  const save = variables => {
    customersEdit({
      variables: { _id: id, ...variables }
    })
      .then(() => {
        Alert.success('Success');
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  const addCompany = ({ doc, callback }) => {
    customersAddCompany({
      variables: { _id: id, ...doc }
    })
      .then(() => {
        customerDetailQuery.refetch();
        Alert.success('Success');
        callback();
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  const updatedProps = {
    ...props,
    customer: {
      ...customerDetailQuery.customerDetail,
      refetch: customerDetailQuery.refetch
    },
    save,
    addCompany,
    customFields: fieldsQuery.fields
  };

  return <CustomerDetails {...updatedProps} />;
};

CustomerDetailsContainer.propTypes = {
  id: PropTypes.string,
  customerDetailQuery: PropTypes.object,
  fieldsQuery: PropTypes.object,
  customersEdit: PropTypes.func,
  customersAddCompany: PropTypes.func
};

export default withCurrentUser(
  compose(
    graphql(gql(queries.customerDetail), {
      name: 'customerDetailQuery',
      options: ({ id }) => ({
        variables: {
          _id: id
        }
      })
    }),
    graphql(gql(queries.fields), {
      name: 'fieldsQuery'
    }),
    // mutations
    graphql(gql(mutations.customersEdit), {
      name: 'customersEdit'
    }),
    graphql(gql(mutations.customersAddCompany), {
      name: 'customersAddCompany'
    })
  )(CustomerDetailsContainer)
);
