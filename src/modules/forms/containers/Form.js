import React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { withRouter } from 'react-router';
import queryString from 'query-string';
import _ from 'underscore';
import { Alert, confirm } from 'modules/common/utils';
import { Bulk } from 'modules/common/components';
import { queries, mutations } from '../graphql';
import { Form } from '../components';
import { FIELDS__CONTENT_TYPES } from '../constants';

class ListContainer extends Bulk {
  render() {
    const {
      brandsQuery,
      formsQuery,
      integrationDetailQuery,
      contentTypeId,
      fieldsQuery,
      fieldsAdd,
      fieldsEdit,
      fieldsRemove,
      fieldsUpdateOrder,
      addMutation,
      editMutation,
      history
    } = this.props;

    if (fieldsQuery.loading || brandsQuery.loading) {
      return false;
    }

    const brands = brandsQuery.brands || [];
    const forms = formsQuery.forms || [];
    const fields = [];
    const integration = integrationDetailQuery.integrationDetail;
    console.log(integration);
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
          contentTypeId: contentTypeId || '',
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

    const doMutation = (mutation, variables) => {
      mutation({
        variables
      })
        .then(() => {
          Alert.success('Congrats');
          history.push('/forms');
        })
        .catch(error => {
          Alert.error(error.message);
          console.log(error.message);
        });
    };

    // save
    const save = doc => {
      if (contentTypeId) {
        return doMutation(editMutation, { ...doc, _id: contentTypeId });
      }

      return doMutation(addMutation, doc);
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
      fields,
      save
    };

    return <Form {...updatedProps} />;
  }
}

ListContainer.propTypes = {
  contentTypeId: PropTypes.string,
  fieldsQuery: PropTypes.object,
  brandsQuery: PropTypes.object,
  formsQuery: PropTypes.object,
  integrationDetailQuery: PropTypes.object,
  fieldsAdd: PropTypes.func,
  fieldsEdit: PropTypes.func,
  fieldsRemove: PropTypes.func,
  fieldsUpdateOrder: PropTypes.func,
  addMutation: PropTypes.func,
  editMutation: PropTypes.func
};

const ListContainerWithData = compose(
  graphql(gql(queries.brands), {
    name: 'brandsQuery',
    options: () => ({
      fetchPolicy: 'network-only'
    })
  }),
  graphql(gql(queries.fields), {
    name: 'fieldsQuery',
    options: ({ formId }) => {
      return {
        variables: {
          contentType: 'form',
          contentTypeId: formId
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
      variables: {
        _id: contentTypeId
      },
      fetchPolicy: 'network-only'
    })
  }),
  graphql(gql(mutations.fieldsAdd), { name: 'fieldsAdd' }),
  graphql(gql(mutations.fieldsEdit), { name: 'fieldsEdit' }),
  graphql(gql(mutations.fieldsRemove), { name: 'fieldsRemove' }),
  graphql(gql(mutations.fieldsUpdateOrder), { name: 'fieldsUpdateOrder' }),
  graphql(gql(mutations.integrationsCreateFormIntegration), {
    name: 'addMutation'
  }),
  graphql(gql(mutations.integrationsEditFormIntegration), {
    name: 'editMutation'
  })
)(ListContainer);

const FormIntegrationListContainer = props => {
  const queryParams = queryString.parse(props.location.search);

  const extendedProps = { ...props, queryParams };
  return <ListContainerWithData {...extendedProps} />;
};

FormIntegrationListContainer.propTypes = {
  location: PropTypes.object,
  history: PropTypes.object
};

export default withRouter(FormIntegrationListContainer);
