import React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Spinner } from 'modules/common/components';
import { Sidebar } from 'modules/layout/components';
import { GenerateCustomFields } from 'modules/settings/properties/components';
import { FIELDS_GROUPS_CONTENT_TYPES } from 'modules/settings/properties/constants';
import { queries as fieldQueries } from 'modules/settings/properties/graphql';
import { mutations } from '../../graphql';

const CustomFieldsSection = (props, context) => {
  const { company, companiesEdit, fieldsGroupsQuery } = props;

  if (fieldsGroupsQuery.loading) {
    return (
      <Sidebar full>
        <Spinner />
      </Sidebar>
    );
  }

  const { _id } = company;

  const save = (variables, callback) => {
    companiesEdit({
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
    customFieldsData: company.customFieldsData || {},
    fieldsGroups: fieldsGroupsQuery.fieldsGroups || []
  };

  return <GenerateCustomFields {...updatedProps} />;
};

CustomFieldsSection.propTypes = {
  company: PropTypes.object.isRequired,
  companiesEdit: PropTypes.func.isRequired,
  fieldsGroupsQuery: PropTypes.object.isRequired
};

const options = () => ({
  refetchQueries: ['companDetail']
});

export default compose(
  graphql(gql(fieldQueries.fieldsGroups), {
    name: 'fieldsGroupsQuery',
    options: () => ({
      variables: {
        contentType: FIELDS_GROUPS_CONTENT_TYPES.COMPANY
      }
    })
  }),
  // mutations
  graphql(gql(mutations.companiesEdit), {
    name: 'companiesEdit',
    options
  })
)(CustomFieldsSection);
