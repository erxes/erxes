import React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Spinner } from 'modules/common/components';
import { Sidebar } from 'modules/layout/components';
import { GenerateCustomFields } from 'modules/settings/properties/components';
import { FIELDS_GROUPS_CONTENT_TYPES } from 'modules/settings/properties/constants';
import { queries as fieldQueries } from 'modules/settings/properties/graphql';
import { queries, mutations } from '../../graphql';

const CustomFieldsSection = (props, context) => {
  const { customer, customersEdit, fieldsGroupsQuery } = props;

  if (fieldsGroupsQuery.loading) {
    return (
      <Sidebar full>
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
    save,
    customFieldsData: customer.customFieldsData || {},
    fieldsGroups: fieldsGroupsQuery.fieldsGroups || []
  };

  return <GenerateCustomFields {...updatedProps} />;
};

CustomFieldsSection.propTypes = {
  customer: PropTypes.object.isRequired,
  customersEdit: PropTypes.func.isRequired,
  fieldsGroupsQuery: PropTypes.object.isRequired
};

const options = ({ customer }) => ({
  refetchQueries: [
    {
      query: gql(queries.customerDetail),
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
)(CustomFieldsSection);
