import gql from 'graphql-tag';
import { Alert, withProps } from 'modules/common/utils';
import {
  AddIntegrationMutationResponse,
  AddIntegrationMutationVariables
} from 'modules/settings/integrations/types';
import {
  AddFieldsMutationResponse,
  AddFieldsMutationVariables
} from 'modules/settings/properties/types';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { withRouter } from 'react-router';
import { IRouterProps } from '../../common/types';
import { BrandsQueryResponse } from '../../settings/brands/types';
import { Form } from '../components';
import { mutations, queries } from '../graphql';
import { AddFormMutationResponse, AddFormMutationVariables } from '../types';

type Props = {
  brandsQuery: BrandsQueryResponse;
} & IRouterProps &
  AddIntegrationMutationResponse &
  AddFieldsMutationResponse &
  AddFormMutationResponse;

class CreateFormContainer extends React.Component<Props, {}> {
  render() {
    const {
      brandsQuery,
      addIntegrationMutation,
      addFormMutation,
      addFieldsMutation,
      history
    } = this.props;

    if (brandsQuery.loading) {
      return false;
    }

    const brands = brandsQuery.brands || [];

    const save = doc => {
      let formId;

      const { form, brandId, name, languageCode, formData, fields } = doc;

      addFormMutation({
        variables: form
      })
        .then(({ data }) => {
          formId = data.formsAdd._id;

          return addIntegrationMutation({
            variables: { formData, brandId, name, languageCode, formId }
          });
        })

        .then(() => {
          const promises: any[] = [];

          for (const field of fields) {
            promises.push(
              addFieldsMutation({
                variables: {
                  contentType: 'form',
                  contentTypeId: formId,
                  ...field
                }
              })
            );
          }

          return Promise.all(promises);
        })

        .then(() => {
          Alert.success('You successfully added a lead');
          history.push('/forms');
        })

        .catch(error => {
          Alert.error(error.message);
        });
    };

    const updatedProps = {
      ...this.props,
      brands,
      fields: [],
      save
    };

    return <Form {...updatedProps} />;
  }
}

export default withProps<{}>(
  compose(
    graphql<{}, BrandsQueryResponse>(gql(queries.brands), {
      name: 'brandsQuery'
    }),
    graphql<
      {},
      AddIntegrationMutationResponse,
      AddIntegrationMutationVariables
    >(gql(mutations.integrationsCreateFormIntegration), {
      name: 'addIntegrationMutation',
      options: {
        refetchQueries: ['formIntegrations', 'formIntegrationCounts']
      }
    }),
    graphql<{}, AddFormMutationResponse, AddFormMutationVariables>(
      gql(mutations.addForm),
      {
        name: 'addFormMutation'
      }
    ),
    graphql<{}, AddFieldsMutationResponse, AddFieldsMutationVariables>(
      gql(mutations.fieldsAdd),
      {
        name: 'addFieldsMutation'
      }
    )
  )(withRouter<Props>(CreateFormContainer))
);
