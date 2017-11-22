import React from 'react';
import PropTypes from 'prop-types';
import { compose, gql, graphql } from 'react-apollo';
import { Alert } from 'modules/common/utils';
import { queries, mutations } from '../graphql';
import { EditInformation } from '../components/detail/sidebar';
import { Spinner } from 'modules/common/components';

const EditInformationContainer = (props, context) => {
  const { customer, customersEdit, customersAddCompany, fieldsQuery } = props;
  if (fieldsQuery.loading) {
    return <Spinner />;
  }

  const { _id } = customer;

  const save = (variables, callback) => {
    customersEdit({
      variables: { _id: _id, ...variables }
    })
      .then(() => {
        customer.refetch();
        callback();
      })
      .catch(e => {
        callback(e);
      });
  };

  const addCompany = ({ doc, callback }) => {
    customersAddCompany({
      variables: { _id: _id, ...doc }
    })
      .then(() => {
        customer.refetch();
        Alert.success('Success');
        callback();
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  const updatedProps = {
    ...props,
    save,
    addCompany,
    currentUser: context.currentUser,
    customFields: fieldsQuery.fields
  };

  return <EditInformation {...updatedProps} />;
};

EditInformationContainer.propTypes = {
  customer: PropTypes.object.isRequired,
  sections: PropTypes.node,
  fieldsQuery: PropTypes.object.isRequired,
  customersEdit: PropTypes.func.isRequired,
  customersAddCompany: PropTypes.func.isRequired
};

EditInformationContainer.contextTypes = {
  currentUser: PropTypes.object
};

export default compose(
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
)(EditInformationContainer);
