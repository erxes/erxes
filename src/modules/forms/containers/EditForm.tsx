import gql from 'graphql-tag';
import { Alert, withProps } from 'modules/common/utils';
import { IField } from 'modules/settings/properties/types';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { withRouter } from 'react-router';
import { IRouterProps } from '../../common/types';
import { BrandsQueryResponse } from '../../settings/brands/containers/Sidebar';
import { FormIntegrationDetailQueryResponse } from '../../settings/integrations/containers/common/IntegrationList';
import { IFormData } from '../../settings/integrations/types';
import { FieldsQueryResponse } from '../../settings/properties/containers/Properties';
import { Form } from '../components';
import { mutations, queries } from '../graphql';
import { IForm } from '../types';

type EditIntegrationMutationResponse = {
  editIntegrationMutation: (
    params: {
      variables: {
        _id: string;
        formData: IFormData;
        brandId: string;
        name: string;
        languageCode: string;
        formId: string;
      };
    }
  ) => Promise<void>;
};

type EditFormMutationResponse = {
  editFormMutation: (
    params: {
      variables: {
        _id: string;
        formId: string;
        form: IForm;
      };
    }
  ) => Promise<any>;
};

type AddFieldMutationResponse = {
  addFieldMutation: (
    params: {
      variables: {
        createFieldsData: IField[];
      };
    }
  ) => Promise<void>;
};

type EditFieldMutationResponse = {
  editFieldMutation: (
    params: {
      variables: {
        updateFieldsData: IField[];
      };
    }
  ) => Promise<void>;
};

type RemoveFieldMutationResponse = {
  removeFieldMutation: (
    params: { variable: { removeFieldsData: IField[] } }
  ) => Promise<void>;
};

type Props = {
  contentTypeId: string;
  formId: string;
  queryParams: any;
};

type FinalProps = {
  fieldsQuery: FieldsQueryResponse;
  brandsQuery: BrandsQueryResponse;
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
          Alert.success('Congrats');

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
      brands,
      integration,
      fields: dbFields.map(field => ({ ...field })),
      save
    };

    return <Form {...updatedProps} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props, BrandsQueryResponse>(gql(queries.brands), {
      name: 'brandsQuery',
      options: () => ({
        fetchPolicy: 'network-only'
      })
    }),
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
    graphql<Props, FormIntegrationDetailQueryResponse, { _id: string }>(
      gql(queries.integrationDetail),
      {
        name: 'integrationDetailQuery',
        options: ({ contentTypeId }) => ({
          variables: {
            _id: contentTypeId
          },
          fetchPolicy: 'network-only'
        })
      }
    ),
    graphql<Props, EditIntegrationMutationResponse>(
      gql(mutations.integrationsEditFormIntegration),
      {
        name: 'editIntegrationMutation',
        options: {
          refetchQueries: ['formIntegrations', 'formIntegrationCounts']
        }
      }
    ),
    graphql<Props, AddFieldMutationResponse>(gql(mutations.fieldsAdd), {
      name: 'addFieldMutation'
    }),
    graphql<Props, EditFieldMutationResponse>(gql(mutations.fieldsEdit), {
      name: 'editFieldMutation'
    }),
    graphql<Props, RemoveFieldMutationResponse>(gql(mutations.fieldsRemove), {
      name: 'removeFieldMutation'
    }),
    graphql<Props, EditFormMutationResponse>(gql(mutations.editForm), {
      name: 'editFormMutation'
    })
  )(withRouter<FinalProps>(EditFormContainer))
);
