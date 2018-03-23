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

const EditInformationContainer = (props, context) => {
  const { customer, customersEdit, fieldsGroupsQuery, wide } = props;

  if (fieldsGroupsQuery.loading) {
    return (
      <Sidebar full wide={wide}>
        <Spinner />
      </Sidebar>
    );
  }

  const { _id } = customer;

  const save = (variables, callback) => {
    customersEdit({
      variables: { _id, ...variables }
    })
      .then(() => {
        callback();
      })
      .catch(e => {
        callback(e);
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
  wide: PropTypes.bool,
  fieldsGroupsQuery: PropTypes.object.isRequired
};

EditInformationContainer.contextTypes = {
  currentUser: PropTypes.object
};

const options = ({ customer }) => ({
  refetchQueries: [
    {
      query: gql`
        ${queries.customerDetail}
      `,
      variables: { _id: customer._id }
    }
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
