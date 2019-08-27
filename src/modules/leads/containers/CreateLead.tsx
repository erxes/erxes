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

class CreateLeadContainer extends React.Component<
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
      let leadId;

      const { form, brandId, name, languageCode, leadData, fields } = doc;

      this.setState({ isLoading: true });

      addFormMutation({
        variables: form
      })
        .then(({ data }) => {
          // tslint:disable-next-line:no-console
          console.log(data);
          leadId = data.formsAdd._id;

          return addIntegrationMutation({
            variables: { leadData, brandId, name, languageCode, leadId }
          });
        })

        .then(() => {
          const promises: any[] = [];

          for (const field of fields) {
            promises.push(
              addFieldsMutation({
                variables: {
                  contentType: 'form',
                  contentTypeId: leadId,
                  ...field
                }
              })
            );
          }

          return Promise.all(promises);
        })

        .then(() => {
          Alert.success('You successfully added a lead');
          history.push('/leads');

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
    >(gql(mutations.integrationsCreateLeadintegration), {
      name: 'addIntegrationMutation',
      options: {
        refetchQueries: ['formIntegrations', 'formIntegrationCounts']
      }
    }),
    graphql<{}, AddFormMutationResponse, AddFormMutationVariables>(
      gql(mutations.addForm)
    ),
    graphql<{}, AddFieldsMutationResponse, AddFieldsMutationVariables>(
      gql(mutations.fieldsAdd),
      {
        name: 'addFieldsMutation'
      }
    )
  )(withRouter<Props>(CreateLeadContainer))
);
