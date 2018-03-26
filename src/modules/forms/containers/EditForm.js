import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { withRouter } from 'react-router';
import { Alert } from 'modules/common/utils';
import { queries, mutations } from '../graphql';
import { Form } from '../components';

class EditFormContainer extends Component {
  render() {
    const {
      formId,
      brandsQuery,
      integrationDetailQuery,
      editIntegrationMutation,
      addFieldMutation,
      editFieldMutation,
      removeFieldMutation,
      editFormMutation,
      fieldsQuery,
      history
    } = this.props;

    if (
      fieldsQuery.loading ||
      brandsQuery.loading ||
      integrationDetailQuery.loading
    ) {
      return false;
    }

    const brands = brandsQuery.brands || [];
    const dbFields = fieldsQuery.fields || [];
    const integration = integrationDetailQuery.integrationDetail || {};

    const save = doc => {
      const { form, brandId, name, languageCode, formData, fields } = doc;

      editFormMutation({ variables: { _id: formId, ...form } })
        .then(() =>
          editIntegrationMutation({
            variables: {
              _id: integration._id,
              formData,
              brandId,
              name,
              languageCode,
              formId: formId
            }
          })
        )

        .then(() => {
          const promises = [];

          const dbFieldIds = dbFields.map(field => field._id);
          const createFieldsData = [];
          const updateFieldsData = [];
          const removeFieldsData = [];
          const existingIds = [];

          for (const field of fields) {
            // existing field
            if (dbFieldIds.includes(field._id)) {
              existingIds.push(field._id);
              updateFieldsData.push(field);
              continue;
            }

            // not existing field
            delete field._id;

            promises.push(
              createFieldsData.push({
                ...field,
                contentType: 'form',
                contentTypeId: formId
              })
            );
          }

          for (const dbFieldId of dbFieldIds) {
            if (!existingIds.includes(dbFieldId)) {
              promises.push(removeFieldsData.push({ _id: dbFieldId }));
            }
          }

          const doMutation = ({ datas, mutation }) => {
            for (const data of datas) {
              mutation({
                variables: data
              });
            }
          };

          doMutation({ datas: createFieldsData, mutation: addFieldMutation });
          doMutation({ datas: updateFieldsData, mutation: editFieldMutation });
          doMutation({
            datas: removeFieldsData,
            mutation: removeFieldMutation
          });

          return Promise.all(promises);
        })

        .then(() => {
          fieldsQuery.refetch();
          Alert.success('Congrats');
          history.push('/forms');
        })

        .catch(error => {
          Alert.error(error.message);
        });
    };

    const updatedProps = {
      ...this.props,
      brands,
      integration,
      fields: dbFields.map(field => ({ ...field })),
      save
    };

    return <Form {...updatedProps} />;
  }
}

EditFormContainer.propTypes = {
  fieldsQuery: PropTypes.object,
  brandsQuery: PropTypes.object,
  integrationDetailQuery: PropTypes.object,
  editIntegrationMutation: PropTypes.func,
  editFormMutation: PropTypes.func,
  addFieldMutation: PropTypes.func,
  editFieldMutation: PropTypes.func,
  removeFieldMutation: PropTypes.func,
  formId: PropTypes.string,
  location: PropTypes.object,
  history: PropTypes.object
};

const EditFormIntegrationContainer = compose(
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
  graphql(gql(queries.integrationDetail), {
    name: 'integrationDetailQuery',
    options: ({ contentTypeId }) => ({
      variables: {
        _id: contentTypeId
      },
      fetchPolicy: 'network-only'
    })
  }),
  graphql(gql(mutations.integrationsEditFormIntegration), {
    name: 'editIntegrationMutation'
  }),
  graphql(gql(mutations.fieldsAdd), {
    name: 'addFieldMutation'
  }),
  graphql(gql(mutations.fieldsEdit), {
    name: 'editFieldMutation'
  }),
  graphql(gql(mutations.fieldsRemove), {
    name: 'removeFieldMutation'
  }),
  graphql(gql(mutations.editForm), {
    name: 'editFormMutation'
  })
)(EditFormContainer);

export default withRouter(EditFormIntegrationContainer);
