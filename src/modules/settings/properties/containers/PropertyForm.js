import React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import { queries, mutations } from '../graphql';
import gql from 'graphql-tag';
import { Alert } from 'modules/common/utils';
import { PropertyForm } from '../components';

const PropertyFormContainer = (props, context) => {
  const { fieldsAdd, fieldsGroupsQuery, fieldsEdit, queryParams } = props;
  const { type = 'Customer' } = queryParams;
  const { currentUser } = context;

  const add = ({ doc }) => {
    fieldsAdd({
      variables: { ...doc, contentType: type, lastUpdatedBy: currentUser._id }
    })
      .then(() => {
        Alert.success('Successfully added');
        fieldsGroupsQuery.refetch();
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  const edit = ({ _id, doc }) => {
    fieldsEdit({
      variables: { _id, ...doc, lastUpdatedBy: currentUser._id }
    })
      .then(() => {
        Alert.success('Successfully edited');
        fieldsGroupsQuery.refetch();
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  const updatedProps = {
    ...props,
    add,
    edit,
    groups: fieldsGroupsQuery.fieldsgroups
  };

  return <PropertyForm {...updatedProps} />;
};

PropertyFormContainer.propTypes = {
  queryParams: PropTypes.object,
  fieldsGroupsQuery: PropTypes.object,
  fieldsAdd: PropTypes.func,
  fieldsEdit: PropTypes.func
};

PropertyFormContainer.contextTypes = {
  currentUser: PropTypes.object,
  closeModal: PropTypes.func
};

export default compose(
  graphql(gql(queries.fieldsgroups), {
    name: 'fieldsGroupsQuery',
    options: ({ queryParams }) => ({
      variables: {
        contentType: queryParams.type
      }
    })
  }),
  graphql(gql(mutations.fieldsAdd), {
    name: 'fieldsAdd'
  }),
  graphql(gql(mutations.fieldsEdit), {
    name: 'fieldsEdit'
  })
)(PropertyFormContainer);
