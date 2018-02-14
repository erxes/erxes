import React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import { queries, mutations } from '../graphql';
import gql from 'graphql-tag';
import { Alert } from 'modules/common/utils';
import { PropertyGroupForm } from '../components';

const PropertyGroupFormContainer = props => {
  const { fieldsGroupsAdd, fieldsQuery, fieldsGroupsEdit } = props;

  const add = ({ doc, callback }) => {
    fieldsGroupsAdd({
      variables: doc
    })
      .then(() => {
        fieldsQuery.refetch();
        Alert.success('Successfully added');
        callback();
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  const edit = ({ _id, doc, callback }) => {
    fieldsGroupsEdit({
      variables: { _id, ...doc }
    })
      .then(() => {
        fieldsQuery.refetch();
        Alert.success('Successfully Edited');
        callback();
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  const updatedProps = {
    ...props,
    add,
    edit
  };

  return <PropertyGroupForm {...updatedProps} />;
};

PropertyGroupFormContainer.propTypes = {
  queryParams: PropTypes.object,
  fieldsQuery: PropTypes.object,
  fieldsGroupsAdd: PropTypes.func,
  fieldsGroupsEdit: PropTypes.func
};

export default compose(
  graphql(gql(queries.fieldsgroups), {
    name: 'fieldsQuery',
    options: ({ queryParams }) => ({
      variables: {
        contentType: queryParams.type
      }
    })
  }),
  graphql(gql(mutations.fieldsGroupsAdd), {
    name: 'fieldsGroupsAdd'
  }),
  graphql(gql(mutations.fieldsGroupsEdit), {
    name: 'fieldsGroupsEdit'
  })
)(PropertyGroupFormContainer);
