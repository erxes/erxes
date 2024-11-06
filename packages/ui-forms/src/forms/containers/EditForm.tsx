import * as compose from "lodash.flowright";

import { Alert, withProps } from "@erxes/ui/src/utils";
import {
  BulkEditAndAddMutationVariables,
  EditFormMutationResponse,
  EditFormMutationVariables,
  FieldsBulkAddAndEditMutationResponse,
  FormDetailQueryResponse,
  IForm,
  IFormData,
  RemoveFieldMutationResponse,
  RemoveFieldMutationVariables,
} from "../types";
import { mutations, queries } from "../graphql";

import { ConfigsQueryResponse } from "@erxes/ui-settings/src/general/types";
import { FieldsQueryResponse } from "@erxes/ui-forms/src/settings/properties/types";
import Form from "../components/Form";
import { IField } from "@erxes/ui/src/types";
import { IIntegration } from "@erxes/ui-inbox/src/settings/integrations/types";
import React from "react";
import { gql } from "@apollo/client";
import { graphql } from "@apollo/client/react/hoc";
import { queries as settingsQueries } from "@erxes/ui-settings/src/general/graphql";

type Props = {
  afterDbSave: (formId: string) => void;
  onDocChange?: (doc: IFormData) => void;
  onInit?: (fields: IField[]) => void;
  formData?: IFormData;
  type: string;
  isReadyToSave: boolean;
  isAviableToSaveWhenReady?: boolean;
  formId: string;
  integration?: IIntegration;
  showMessage?: boolean;
  fieldTypes?: string[];
  name?: string;
};

type FinalProps = {
  fieldsQuery: FieldsQueryResponse;
  formDetailQuery: FormDetailQueryResponse;
  configsQuery: ConfigsQueryResponse;
} & Props &
  EditFormMutationResponse &
  RemoveFieldMutationResponse &
  FieldsBulkAddAndEditMutationResponse;

class EditFormContainer extends React.Component<FinalProps> {
  static defaultProps = {
    showMessage: true,
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
      configsQuery,
      showMessage,
    } = this.props;

    if (
      fieldsQuery.loading ||
      formDetailQuery.loading ||
      configsQuery.loading
    ) {
      return false;
    }

    const dbFields = fieldsQuery.fields || [];
    const form = formDetailQuery.formDetail || {};

    const saveForm = (doc) => {
      const { title, description, buttonText, type, numberOfPages } = doc;
      let { fields } = doc;

      editFormMutation({
        variables: {
          _id: formId,
          title,
          description,
          buttonText,
          numberOfPages: Number(numberOfPages),
          type,
          name: this.props.name,
        },
      })
        .then(() => {
          const dbFieldIds = dbFields.map((field) => field._id);
          const existingIds: string[] = [];
          const removeFieldsData: Array<{ _id: string }> = [];

          // remove unnecessary fields
          fields = fields.map((f) => {
            const { contentType, associatedField, __typename, ...rest } = f;
            const logics = f.logics?.map(({ __typename: t, ...l }) => l);
            const objectListConfigs = f.objectListConfigs?.map(
              ({ __typename: t, ...config }) => config
            );
            return { ...rest, logics, objectListConfigs };
          });

          const newFields = fields
            .filter((field) => field._id.startsWith("tempId"))
            .map(({ _id, ...rest }) => {
              return {
                tempFieldId: _id,
                ...rest,
              };
            });

          const updatedFields = fields.filter(
            (field) => !field._id.startsWith("tempId")
          );

          fieldsBulkAddAndEditMutation({
            variables: {
              contentType: "form",
              contentTypeId: formId,
              newFields,
              updatedFields,
            },
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
            if (!existingIds.includes(dbFieldId || "")) {
              removeFieldsData.push({ _id: dbFieldId || "" });
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
            mutation: removeFieldMutation,
          });

          return Promise.all(promises);
        })

        .then(() => {
          if (showMessage) {
            Alert.success("You successfully updated a form");
          }

          fieldsQuery.refetch().then(() => {
            !this.props.formId && afterDbSave(formId);
          });
        })

        .catch((error) => {
          Alert.error(error.message);
        });
    };

    const updatedProps = {
      ...this.props,
      fields: dbFields.map((field) => ({ ...field })),
      saveForm,
      form: form as IForm,
      configs: configsQuery.configs || [],
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
      name: "fieldsQuery",
      options: ({ formId }) => {
        return {
          variables: {
            contentType: "form",
            contentTypeId: formId,
          },
          fetchPolicy: "network-only",
        };
      },
    }),
    graphql<Props, FormDetailQueryResponse, { _id: string }>(
      gql(queries.formDetail),
      {
        name: "formDetailQuery",
        options: ({ formId }) => ({
          variables: {
            _id: formId,
          },
        }),
      }
    ),
    graphql<{}, ConfigsQueryResponse>(gql(settingsQueries.configs), {
      name: "configsQuery",
    }),
    graphql<
      Props,
      FieldsBulkAddAndEditMutationResponse,
      BulkEditAndAddMutationVariables
    >(gql(mutations.fieldsBulkAction), {
      name: "fieldsBulkAction",
    }),
    graphql<Props, EditFormMutationResponse, EditFormMutationVariables>(
      gql(mutations.editForm),
      {
        name: "editFormMutation",
      }
    ),
    graphql<Props, RemoveFieldMutationResponse, RemoveFieldMutationVariables>(
      gql(mutations.fieldsRemove),
      {
        name: "removeFieldMutation",
      }
    )
  )(EditFormContainer)
);
