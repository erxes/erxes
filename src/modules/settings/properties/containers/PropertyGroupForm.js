import React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import { queries, mutations } from '../graphql';
import gql from 'graphql-tag';
import { Alert } from 'modules/common/utils';
import { PropertyGroupForm } from '../components';

const PropertyGroupFormContainer = props => {
  const { fieldsGroupsAdd, fieldsGroupsEdit, queryParams } = props;

  const { type } = queryParams;

  const add = ({ doc }) => {
    fieldsGroupsAdd({
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
    fieldsGroupsEdit({
      variables: {
        _id,
        ...doc
      }
    })
      .then(() => {
        Alert.success('Successfully Edited');
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

const options = ({ queryParams }) => ({
  refetchQueries: [
    {
      query: gql`${queries.fieldsGroups}`,
      variables: { contentType: queryParams.type }
    }
  ]
});

PropertyGroupFormContainer.propTypes = {
  queryParams: PropTypes.object,
  fieldsGroupsAdd: PropTypes.func.isRequired,
  fieldsGroupsEdit: PropTypes.func.isRequired
};

PropertyGroupFormContainer.contextTypes = {
  closeModal: PropTypes.func
};

export default compose(
  graphql(gql(mutations.fieldsGroupsAdd), {
    name: 'fieldsGroupsAdd',
    options
  }),
  graphql(gql(mutations.fieldsGroupsEdit), {
    name: 'fieldsGroupsEdit',
    options
  })
)(PropertyGroupFormContainer);
