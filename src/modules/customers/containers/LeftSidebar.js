import React from 'react';
import PropTypes from 'prop-types';
import { compose, gql, graphql } from 'react-apollo';
import { Alert } from 'modules/common/utils';
import { queries, mutations } from '../graphql';
import { LeftSidebar } from '../components/detail/sidebar';
import { Spinner } from 'modules/common/components';

const LeftSidebarContainer = (props, context) => {
  const {
    id,
    customerDetailQuery,
    customersEdit,
    customersAddCompany,
    fieldsQuery
  } = props;

  if (customerDetailQuery.loading || fieldsQuery.loading) {
    return <Spinner />;
  }

  const save = (variables, callback) => {
    customersEdit({
      variables: { _id: id, ...variables }
    })
      .then(() => {
        callback();
        customerDetailQuery.refetch();
      })
      .catch(e => {
        callback(e);
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

  return <LeftSidebar {...updatedProps} />;
};

LeftSidebarContainer.propTypes = {
  id: PropTypes.string.isRequired,
  sections: PropTypes.node,
  customerDetailQuery: PropTypes.object.isRequired,
  fieldsQuery: PropTypes.object.isRequired,
  customersEdit: PropTypes.func.isRequired,
  customersAddCompany: PropTypes.func.isRequired
};

LeftSidebarContainer.contextTypes = {
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
  graphql(gql(mutations.customersAddCompany), {
    name: 'customersAddCompany'
  }),
  graphql(gql(mutations.customersEdit), {
    name: 'customersEdit'
  })
)(LeftSidebarContainer);
