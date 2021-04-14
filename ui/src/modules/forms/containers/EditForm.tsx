import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { Alert, withProps } from 'modules/common/utils';
import { IIntegration } from 'modules/settings/integrations/types';
import { FieldsQueryResponse, IField } from 'modules/settings/properties/types';
import React from 'react';
import { graphql } from 'react-apollo';
import { withRouter } from 'react-router-dom';
import { IRouterProps } from '../../common/types';
import Form from '../components/Form';
import { mutations, queries } from '../graphql';
import {
  BulkEditAndAddMutationVariables,
  EditFormMutationResponse,
  EditFormMutationVariables,
  FieldsBulkAddAndEditMutationResponse,
  FormDetailQueryResponse,
  IFormData,
  RemoveFieldMutationResponse,
  RemoveFieldMutationVariables
} from '../types';

type Props = {
  afterDbSave: (formId: string) => void;
  onDocChange?: (doc: IFormData) => void;
  onInit?: (fields: IField[]) => void;
  formData?: IFormData;
  type: string;
  isReadyToSave: boolean;
  formId: string;
  integration?: IIntegration;
  showMessage?: boolean;
};

type FinalProps = {
  fieldsQuery: FieldsQueryResponse;
  formDetailQuery: FormDetailQueryResponse;
} & Props &
  EditFormMutationResponse &
  RemoveFieldMutationResponse &
  FieldsBulkAddAndEditMutationResponse &
  IRouterProps;

class EditFormContainer extends React.Component<FinalProps> {
  static defaultProps = {
    showMessage: true
  };

  componentWillReceiveProps(nextProps: FinalProps) {
    const { onInit, fieldsQuery } = this.props;

    if (fieldsQuery.loading && !nextProps.fieldsQuery.loading && onInit) {
      onInit(nextProps.fieldsQuery.fields || []);
    }
  }

  render() {
    const {
      formId,
      afterDbSave,
      removeFieldMutation,
      editFormMutation,
      fieldsBulkAddAndEditMutation,
      fieldsQuery,
      formDetailQuery,
      showMessage
    } = this.props;

    if (fieldsQuery.loading || formDetailQuery.loading) {
      return false;
    }

    const dbFields = fieldsQuery.fields || [];
    const form = formDetailQuery.formDetail || {};

    const saveForm = doc => {
      const { title, desc, btnText, fields, type } = doc;

      editFormMutation({
        variables: {
          _id: formId,
          title,
          description: desc,
          buttonText: btnText,
          type
        }
      })
        .then(() => {
          const dbFieldIds = dbFields.map(field => field._id);
          const existingIds: string[] = [];
          const removeFieldsData: Array<{ _id: string }> = [];

          // remove unnecessary fields
          fields.forEach(f => {
            delete f.field;
            delete f.contentType;
            delete f.__typename;

            if (f.logics && f.logics.lenth > 0) {
              f.logics = f.logics.map(l => {
                delete l.__typename;
                return l;
              });
            }
          });

          const addingFields = fields
            .filter(field => field._id.startsWith('tempId'))
            .map(({ _id, ...rest }) => {
              delete rest.associatedField;
              return {
                tempFieldId: _id,
                ...rest
              };
            });

          const editingFields = fields
            .filter(field => !field._id.startsWith('tempId'))
            .map(e => {
              delete e.associatedField;
              return e;
            });

          fieldsBulkAddAndEditMutation({
            variables: {
              contentType: 'form',
              contentTypeId: formId,
              addingFields,
              editingFields
            }
          });

          // collect fields ================
          for (const field of fields) {
            // collect fields to update
            if (dbFieldIds.includes(field._id)) {
              existingIds.push(field._id);
              continue;
            }
          }

          // collect fields to remove
          for (const dbFieldId of dbFieldIds) {
            if (!existingIds.includes(dbFieldId || '')) {
              removeFieldsData.push({ _id: dbFieldId || '' });
            }
          }

          // // save fields ===================
          const promises: any[] = [];

          const doMutation = ({ datas, mutation }) => {
            for (const data of datas) {
              promises.push(mutation({ variables: data }));
            }
          };

          doMutation({
            datas: removeFieldsData,
            mutation: removeFieldMutation
          });

          return Promise.all(promises);
        })

        .then(() => {
          if (showMessage) {
            Alert.success('You successfully updated a form');
          }

          fieldsQuery.refetch().then(() => {
            afterDbSave(formId);
          });
        })

        .catch(error => {
          Alert.error(error.message);
        });
    };

    const updatedProps = {
      ...this.props,
      fields: dbFields.map(field => ({ ...field })),
      saveForm,
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
          },
          fetchPolicy: 'network-only'
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
    graphql<
      Props,
      FieldsBulkAddAndEditMutationResponse,
      BulkEditAndAddMutationVariables
    >(gql(mutations.fieldsBulkAddAndEdit), {
      name: 'fieldsBulkAddAndEditMutation'
    }),
    graphql<Props, EditFormMutationResponse, EditFormMutationVariables>(
      gql(mutations.editForm),
      {
        name: 'editFormMutation'
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
