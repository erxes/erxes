import React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import { queries, mutations } from '../graphql';
import gql from 'graphql-tag';
import { Alert } from 'modules/common/utils';
import { PropertyForm } from '../components';

const PropertyFormContainer = props => {
  const { fieldsAdd, fieldsGroupsQuery, fieldsEdit, queryParams } = props;
  const { type } = queryParams;

  const add = ({ doc }) => {
    fieldsAdd({
      variables: {
        ...doc,
        contentType: type
      }
    })
      .then(() => {
        Alert.success('Successfully added');
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  const edit = ({ _id, doc }) => {
    fieldsEdit({
      variables: {
        _id,
        ...doc
      }
    })
      .then(() => {
        Alert.success('Successfully edited');
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  const updatedProps = {
    ...props,
    add,
    edit,
    groups: fieldsGroupsQuery.fieldsGroups
  };

  return <PropertyForm {...updatedProps} />;
};

const options = ({ queryParams }) => ({
  refetchQueries: [
    {
      query: gql`${queries.fieldsGroups}`,
      variables: { contentType: queryParams.type }
    }
  ]
});

PropertyFormContainer.propTypes = {
  queryParams: PropTypes.object,
  fieldsGroupsQuery: PropTypes.object,
  fieldsAdd: PropTypes.func,
  fieldsEdit: PropTypes.func
};

PropertyFormContainer.contextTypes = {
  closeModal: PropTypes.func
};

export default compose(
  graphql(gql(queries.fieldsGroups), {
    name: 'fieldsGroupsQuery',
    options: ({ queryParams }) => ({
      variables: {
        contentType: queryParams.type
      }
    })
  }),
  graphql(gql(mutations.fieldsAdd), {
    name: 'fieldsAdd',
    options
  }),
  graphql(gql(mutations.fieldsEdit), {
    name: 'fieldsEdit',
    options
  })
)(PropertyFormContainer);
