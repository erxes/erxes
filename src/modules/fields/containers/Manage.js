import _ from 'underscore';
import React from 'react';
import PropTypes from 'prop-types';
import { compose, gql, graphql } from 'react-apollo';
import { Alert } from 'modules/common/utils';
import { Manage } from '../components';
import { queries, mutations } from '../graphql';

const ManageContainer = props => {
  const {
    contentType,
    fieldsQuery,
    fieldsAdd,
    fieldsEdit,
    fieldsRemove,
    fieldsUpdateOrder
  } = props;

  if (fieldsQuery.loading) {
    return false;
  }

  const fields = [];

  // cloning graphql results, because in component we need to change
  // each field's attributes and it is immutable. so making it mutable
  fieldsQuery.fields.forEach(field => {
    fields.push({ ...field });
  });

  // create field
  const addField = doc => {
    fieldsAdd({
      variables: {
        contentType,
        ...doc
      }
    }).then(() => {
      fieldsQuery.refetch();
      Alert.success('Success');
    });
  };

  // edit field
  const editField = (_id, doc) => {
    fieldsEdit({
      variables: { _id, ...doc }
    }).then(() => {
      Alert.success('Success');
    });
  };

  // delete field
  const deleteField = _id => {
    // TODO confirm

    fieldsRemove({
      variables: { _id }
    }).then(() => {
      fieldsQuery.refetch();
      Alert.success('Success');
    });
  };

  // update orders
  const onSort = fields => {
    const orders = [];

    _.each(fields, (field, index) => {
      orders.push({ _id: field._id, order: index });
    });

    fieldsUpdateOrder({
      variables: { orders }
    });
  };

  const updatedProps = {
    ...props,
    addField,
    editField,
    deleteField,
    onSort,
    fields
  };

  return <Manage {...updatedProps} />;
};

ManageContainer.propTypes = {
  contentType: PropTypes.string,
  fieldsQuery: PropTypes.object,
  fieldsAdd: PropTypes.func,
  fieldsEdit: PropTypes.func,
  fieldsRemove: PropTypes.func,
  fieldsUpdateOrder: PropTypes.func
};

export default compose(
  graphql(gql(queries.fields), {
    name: 'fieldsQuery',
    options: ({ contentType, contentTypeId }) => {
      return {
        variables: {
          contentType,
          contentTypeId
        }
      };
    }
  }),
  graphql(gql(mutations.fieldsAdd), {
    name: 'fieldsAdd'
  }),
  graphql(gql(mutations.fieldsEdit), {
    name: 'fieldsEdit'
  }),
  graphql(gql(mutations.fieldsRemove), {
    name: 'fieldsRemove'
  }),
  graphql(gql(mutations.fieldsUpdateOrder), {
    name: 'fieldsUpdateOrder'
  })
)(ManageContainer);
