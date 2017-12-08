import React from 'react';
import PropTypes from 'prop-types';
import { compose, gql, graphql } from 'react-apollo';
import { queries, mutations } from '../graphql';
import { EditInformation } from '../components/detail/sidebar';
import { Spinner } from 'modules/common/components';
import { Alert } from 'modules/common/utils';
import { Sidebar } from 'modules/layout/components';

const EditInformationContainer = (props, context) => {
  const {
    customer,
    customersEdit,
    fieldsQuery,
    customersEditCompanies
  } = props;
  if (fieldsQuery.loading) {
    return (
      <Sidebar full>
        <Spinner />
      </Sidebar>
    );
  }

  const { _id } = customer;

  const save = (variables, callback) => {
    customersEdit({
      variables: { _id: _id, ...variables }
    })
      .then(() => {
        callback();
      })
      .catch(e => {
        callback(e);
      });
  };

  const editCompanies = variables => {
    customersEditCompanies({
      variables: { _id: _id, ...variables }
    })
      .then(() => {
        Alert.success('Successfully saved');
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  const updatedProps = {
    ...props,
    save,
    editCompanies,
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
  customersEditCompanies: PropTypes.func.isRequired
};

EditInformationContainer.contextTypes = {
  currentUser: PropTypes.object
};

const options = ({ customer }) => ({
  refetchQueries: [
    { query: gql`${queries.customerDetail}`, variables: { _id: customer._id } }
  ]
});

export default compose(
  graphql(gql(queries.fields), {
    name: 'fieldsQuery',
    options: () => ({
      notifyOnNetworkStatusChange: true
    })
  }),
  // mutations
  graphql(gql(mutations.customersEdit), {
    name: 'customersEdit',
    options
  }),
  graphql(gql(mutations.customersEditCompanies), {
    name: 'customersEditCompanies',
    options
  })
)(EditInformationContainer);
