import gql from 'graphql-tag';
import { Alert, withProps } from 'modules/common/utils';
import {
  EditIntegrationMutationResponse,
  EditIntegrationMutationVariables,
  FormIntegrationDetailQueryResponse
} from 'modules/settings/integrations/types';
import { FieldsQueryResponse, IField } from 'modules/settings/properties/types';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { withRouter } from 'react-router';
import { IRouterProps } from '../../common/types';
import { Form } from '../components';
import { mutations, queries } from '../graphql';
import {
  AddFieldMutationResponse,
  AddFieldMutationVariables,
  EditFieldMutationResponse,
  EditFieldMutationVariables,
  EditFormMutationResponse,
  EditFormMutationVariables,
  RemoveFieldMutationResponse,
  RemoveFieldMutationVariables
} from '../types';

type Props = {
  contentTypeId: string;
  formId: string;
  queryParams: any;
};

type FinalProps = {
  fieldsQuery: FieldsQueryResponse;
  integrationDetailQuery: FormIntegrationDetailQueryResponse;
} & Props &
  EditIntegrationMutationResponse &
  EditFormMutationResponse &
  AddFieldMutationResponse &
  EditFieldMutationResponse &
  RemoveFieldMutationResponse &
  IRouterProps;

class EditFormContainer extends React.Component<FinalProps, {}> {
  render() {
    const {
      formId,
      integrationDetailQuery,
      editIntegrationMutation,
      addFieldMutation,
      editFieldMutation,
      removeFieldMutation,
      editFormMutation,
      fieldsQuery,
      history
    } = this.props;

    if (fieldsQuery.loading || integrationDetailQuery.loading) {
      return false;
    }

    const dbFields = fieldsQuery.fields || [];
    const integration = integrationDetailQuery.integrationDetail || {};

    const save = doc => {
      const { form, brandId, name, languageCode, formData, fields } = doc;

      // edit form
      editFormMutation({ variables: { _id: formId, ...form } })
        .then(() =>
          // edit integration
          editIntegrationMutation({
            variables: {
              _id: integration._id,
              formData,
              brandId,
              name,
              languageCode,
              formId
            }
          })
        )

        .then(() => {
          const dbFieldIds = dbFields.map(field => field._id);
          const existingIds: string[] = [];
          const createFieldsData: IField[] = [];
          const updateFieldsData: IField[] = [];
          const removeFieldsData: Array<{ _id: string }> = [];

          // collect fields ================
          for (const field of fields) {
            // collect fields to update
            if (dbFieldIds.includes(field._id)) {
              existingIds.push(field._id);
              updateFieldsData.push(field);
              continue;
            }

            // collect fields to create
            delete field._id;

            createFieldsData.push({
              ...field,
              contentType: 'form',
              contentTypeId: formId
            });
          }

          // collect fields to remove
          for (const dbFieldId of dbFieldIds) {
            if (!existingIds.includes(dbFieldId)) {
              removeFieldsData.push({ _id: dbFieldId });
            }
          }

          // save fields ===================
          const promises: any[] = [];

          const doMutation = ({ datas, mutation }) => {
            for (const data of datas) {
              promises.push(mutation({ variables: data }));
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
          Alert.success('You successfully updated a lead');

          fieldsQuery.refetch().then(() => {
            history.push('/forms');
          });
        })

        .catch(error => {
          Alert.error(error.message);
        });
    };

    const updatedProps = {
      ...this.props,
      integration,
      fields: dbFields.map(field => ({ ...field })),
      save
    };

    return <Form {...updatedProps} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<
      Props,
      FieldsQueryResponse,
      { contentType: string; contentTypeId: string }
    >(gql(queries.fields), {
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
    graphql<Props, FormIntegrationDetailQueryResponse, { _id: string }>(
      gql(queries.integrationDetail),
      {
        name: 'integrationDetailQuery',
        options: ({ contentTypeId }) => ({
          variables: {
            _id: contentTypeId
          }
        })
      }
    ),
    graphql<
      Props,
      EditIntegrationMutationResponse,
      EditIntegrationMutationVariables
    >(gql(mutations.integrationsEditFormIntegration), {
      name: 'editIntegrationMutation',
      options: {
        refetchQueries: ['formIntegrations', 'formIntegrationCounts']
      }
    }),
    graphql<Props, AddFieldMutationResponse, AddFieldMutationVariables>(
      gql(mutations.fieldsAdd),
      {
        name: 'addFieldMutation'
      }
    ),
    graphql<Props, EditFieldMutationResponse, EditFieldMutationVariables>(
      gql(mutations.fieldsEdit),
      {
        name: 'editFieldMutation'
      }
    ),
    graphql<Props, RemoveFieldMutationResponse, RemoveFieldMutationVariables>(
      gql(mutations.fieldsRemove),
      {
        name: 'removeFieldMutation'
      }
    ),
    graphql<Props, EditFormMutationResponse, EditFormMutationVariables>(
      gql(mutations.editForm),
      {
        name: 'editFormMutation'
      }
    )
  )(withRouter<FinalProps>(EditFormContainer))
);
