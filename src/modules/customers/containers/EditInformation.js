import React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { FIELDS_GROUPS_CONTENT_TYPES } from 'modules/settings/properties/constants';
import { queries, mutations } from '../graphql';
import { queries as fieldQueries } from 'modules/settings/properties/graphql';
import { EditInformation } from '../components/detail/sidebar';
import { Spinner } from 'modules/common/components';
import { Sidebar } from 'modules/layout/components';
import { Alert } from 'modules/common/utils';

const EditInformationContainer = (props, context) => {
  const { customer, customersEdit, fieldsGroupsQuery } = props;

  if (fieldsGroupsQuery.loading) {
    return (
      <Sidebar full>
        <Spinner />
      </Sidebar>
    );
  }

  const { _id } = customer;

  const save = ({ doc, callback }) => {
    customersEdit({
      variables: { _id: _id, ...doc }
    })
      .then(() => {
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
    customFieldsData: customer.customFieldsData || {},
    currentUser: context.currentUser,
    fieldsGroups: fieldsGroupsQuery.fieldsGroups || []
  };

  return <EditInformation {...updatedProps} />;
};

EditInformationContainer.propTypes = {
  customer: PropTypes.object.isRequired,
  sections: PropTypes.node,
  customersEdit: PropTypes.func.isRequired,
  fieldsGroupsQuery: PropTypes.object.isRequired
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
  graphql(gql(fieldQueries.fieldsGroups), {
    name: 'fieldsGroupsQuery',
    options: () => ({
      variables: {
        contentType: FIELDS_GROUPS_CONTENT_TYPES.CUSTOMER
      }
    })
  }),
  // mutations
  graphql(gql(mutations.customersEdit), {
    name: 'customersEdit',
    options
  })
)(EditInformationContainer);
