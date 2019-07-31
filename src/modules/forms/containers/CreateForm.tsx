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
import React from 'react';
import { compose, graphql } from 'react-apollo';
import { withRouter } from 'react-router';
import { IRouterProps } from '../../common/types';
import Form from '../components/Form';
import { mutations } from '../graphql';
import { AddFormMutationResponse, AddFormMutationVariables } from '../types';

type Props = {} & IRouterProps &
  AddIntegrationMutationResponse &
  AddFieldsMutationResponse &
  AddFormMutationResponse;

class CreateFormContainer extends React.Component<
  Props,
  { isLoading: boolean }
> {
  constructor(props: Props) {
    super(props);

    this.state = { isLoading: false };
  }

  render() {
    const {
      addIntegrationMutation,
      addFormMutation,
      addFieldsMutation,
      history
    } = this.props;

    const save = doc => {
      let formId;

      const { form, brandId, name, languageCode, formData, fields } = doc;

      this.setState({ isLoading: true });

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

          this.setState({ isLoading: false });
        })

        .catch(error => {
          Alert.error(error.message);

          this.setState({ isLoading: false });
        });
    };

    const updatedProps = {
      ...this.props,
      fields: [],
      save,
      isActionLoading: this.state.isLoading
    };

    return <Form {...updatedProps} />;
  }
}

export default withProps<{}>(
  compose(
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
