import gql from 'graphql-tag';
import { Alert, withProps } from 'modules/common/utils';
import { IIntegration } from 'modules/settings/integrations/types';
import { FieldsQueryResponse, IField } from 'modules/settings/properties/types';
import React from 'react';
import { compose, graphql } from 'react-apollo';
import { withRouter } from 'react-router';
import { IRouterProps } from '../../common/types';
import Form from '../components/Form';
import { mutations, queries } from '../graphql';
import {
  AddFieldMutationResponse,
  AddFieldMutationVariables,
  EditFieldMutationResponse,
  EditFieldMutationVariables,
  EditFormMutationResponse,
  EditFormMutationVariables,
  FormDetailQueryResponse,
  IFormData,
  IFormPreviewContent,
  RemoveFieldMutationResponse,
  RemoveFieldMutationVariables
} from '../types';

type Props = {
  renderPreview: (props: IFormPreviewContent) => void;
  onChange: (callback: string | FieldsQueryResponse) => void;
  onDocChange: (doc: IFormData) => void;
  isSaving: boolean;
  formId: string;
  integration?: IIntegration;
};

type FinalProps = {
  fieldsQuery: FieldsQueryResponse;
  formDetailQuery: FormDetailQueryResponse;
} & Props &
  EditFormMutationResponse &
  AddFieldMutationResponse &
  EditFieldMutationResponse &
  RemoveFieldMutationResponse &
  IRouterProps;

class EditFormContainer extends React.Component<FinalProps> {
  render() {
    const {
      formId,
      onChange,
      addFieldMutation,
      editFieldMutation,
      editFormMutation,
      removeFieldMutation,
      fieldsQuery,
      formDetailQuery
    } = this.props;

    if (fieldsQuery.loading || formDetailQuery.loading) {
      return false;
    }

    const dbFields = fieldsQuery.fields || [];
    const form = formDetailQuery.formDetail || {};

    const save = doc => {
      const { title, description, buttonText, fields, type } = doc;

      editFormMutation({
        variables: {
          _id: formId,
          title,
          description,
          buttonText,
          type
        }
      })
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
          onChange(fieldsQuery);
        })

        .catch(error => {
          Alert.error(error.message);
        });
    };

    const updatedProps = {
      ...this.props,
      fields: dbFields.map(field => ({ ...field })),
      saveForm: save,
      form
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
    graphql<Props, FormDetailQueryResponse, { _id: string }>(
      gql(queries.formDetail),
      {
        name: 'formDetailQuery',
        options: ({ formId }) => ({
          variables: {
            _id: formId
          }
        })
      }
    ),
    graphql<Props, AddFieldMutationResponse, AddFieldMutationVariables>(
      gql(mutations.fieldsAdd),
      {
        name: 'addFieldMutation'
      }
    ),
    graphql<Props, EditFormMutationResponse, EditFormMutationVariables>(
      gql(mutations.editForm),
      {
        name: 'editFormMutation'
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
    )
  )(withRouter<FinalProps>(EditFormContainer))
);
