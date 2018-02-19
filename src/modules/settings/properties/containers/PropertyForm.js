import React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import { queries, mutations } from '../graphql';
import gql from 'graphql-tag';
import { Alert } from 'modules/common/utils';
import { PropertyForm } from '../components';

const PropertyFormContainer = props => {
  const { fieldsGroupsAdd, fieldsQuery } = props;

  const add = ({ doc, callback }) => {
    fieldsGroupsAdd({
      variables: doc
    })
      .then(() => {
        callback();
        fieldsQuery.refetch();
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  const edit = ({ doc, callback }) => {
    fieldsGroupsAdd({
      variables: doc
    })
      .then(() => {
        callback();
        fieldsQuery.refetch();
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  const updatedProps = {
    ...props,
    add,
    edit,
    groups: fieldsQuery.fieldsgroups
  };

  return <PropertyForm {...updatedProps} />;
};

PropertyFormContainer.propTypes = {
  queryParams: PropTypes.object,
  fieldsQuery: PropTypes.object,
  fieldsGroupsAdd: PropTypes.func
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
  })
)(PropertyFormContainer);
