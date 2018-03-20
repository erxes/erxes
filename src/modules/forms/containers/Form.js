import React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import _ from 'underscore';
import { Alert, confirm } from 'modules/common/utils';
import { queries, mutations } from '../graphql';
import { Form } from '../components';
import { FIELDS__CONTENT_TYPES } from '../constants';

const ListContainer = props => {
  const {
    brandsQuery,
    formsQuery,
    integrationDetailQuery,
    contentTypeId,
    fieldsQuery,
    fieldsAdd,
    fieldsEdit,
    fieldsRemove,
    fieldsUpdateOrder
  } = props;

  if (
    brandsQuery.loading ||
    integrationDetailQuery.loading ||
    fieldsQuery.loading
  ) {
    return false;
  }

  const brands = brandsQuery.brands || [];
  const forms = formsQuery.forms || [];
  const fields = [];
  const integration = integrationDetailQuery.integrationDetail || {};

  // cloning graphql results, because in component we need to change
  // each field's attributes and it is immutable. so making it mutable
  fieldsQuery.fields.forEach(field => {
    fields.push({ ...field });
  });

  // create field
  const addField = doc => {
    fieldsAdd({
      variables: {
        contentType: FIELDS__CONTENT_TYPES.FORM,
        contentTypeId,
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
    confirm().then(() => {
      fieldsRemove({ variables: { _id } }).then(() => {
        fieldsQuery.refetch();
        Alert.success('Success');
      });
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
    ...this.props,
    brands,
    forms,
    integration,
    contentTypeId,
    addField,
    editField,
    deleteField,
    onSort,
    fields
  };

  return <Form {...updatedProps} />;
};

ListContainer.propTypes = {
  contentTypeId: PropTypes.string,
  fieldsQuery: PropTypes.object,
  brandsQuery: PropTypes.object,
  formsQuery: PropTypes.object,
  integrationDetailQuery: PropTypes.object,
  fieldsAdd: PropTypes.func,
  fieldsEdit: PropTypes.func,
  fieldsRemove: PropTypes.func,
  fieldsUpdateOrder: PropTypes.func
};

export default compose(
  graphql(gql(queries.brands), {
    name: 'brandsQuery',
    options: () => ({
      fetchPolicy: 'network-only'
    })
  }),
  graphql(gql(queries.fields), {
    name: 'fieldsQuery',
    options: () => {
      return {
        variables: {
          contentType: FIELDS__CONTENT_TYPES.FORM,
          contentTypeId: '2xJZpp7RxNNZxJ89v'
        }
      };
    }
  }),
  graphql(gql(queries.forms), {
    name: 'formsQuery',
    options: () => ({
      fetchPolicy: 'network-only'
    })
  }),
  graphql(gql(queries.integrationDetail), {
    name: 'integrationDetailQuery',
    options: ({ contentTypeId }) => ({
      fetchPolicy: 'network-only',
      variables: {
        _id: contentTypeId
      }
    })
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
  }),
  graphql(gql(mutations.integrationsCreateFormIntegration), {
    name: 'addMutation'
  }),
  graphql(gql(mutations.integrationsEditFormIntegration), {
    name: 'editMutation'
  })
)(ListContainer);
