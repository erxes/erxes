import React from 'react';
import PropTypes from 'prop-types';
import { compose, gql, graphql } from 'react-apollo';
import { Alert } from 'modules/common/utils';
import { Loading } from 'modules/common/components';
import { queries, mutations } from '../graphql';
import { CustomerDetails } from '../components';

const CustomerDetailsContainer = (props, context) => {
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
    currentUser: context.currentUser,
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
)(CustomerDetailsContainer);
