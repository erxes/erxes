import gql from 'graphql-tag';
import { Alert, withProps } from 'modules/common/utils';
import {
  AddIntegrationMutationResponse,
  AddIntegrationMutationVariables,
  ILeadData
} from 'modules/settings/integrations/types';
import { AddFieldsMutationResponse } from 'modules/settings/properties/types';
import React from 'react';
import { compose, graphql } from 'react-apollo';
import { withRouter } from 'react-router';
import { IRouterProps } from '../../common/types';
import Form from '../components/Form';
import { mutations } from '../graphql';
import {
  AddLeadMutationResponse,
  AddLeadMutationVariables,
  ILead
} from '../types';

type Props = {} & IRouterProps &
  AddIntegrationMutationResponse &
  AddFieldsMutationResponse &
  AddLeadMutationResponse;

type State = {
  isLoading: boolean;
  isSaving: boolean;
  doc?: {
    brandId: string;
    name: string;
    languageCode: string;
    lead: ILead;
    leadData: ILeadData;
  };
};

class CreateLeadContainer extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = { isLoading: false, isSaving: false };
  }

  render() {
    const { addIntegrationMutation, addLeadMutation, history } = this.props;
    let leadId;

    const onLeadChange = doc => {
      this.setState({ isSaving: false });

      if (this.state.doc) {
        const { lead, leadData, brandId, name, languageCode } = this.state.doc;

        addLeadMutation({
          variables: {
            formId: doc.formId,
            callout: lead.callout,
            rules: lead.rules,
            themeColor: lead.themeColor
          }
        })
          .then(({ data }) => {
            leadId = data.leadsAdd._id;

            return addIntegrationMutation({
              variables: { leadData, brandId, name, languageCode, leadId }
            });
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
      }
    };

    const save = doc => {
      this.setState({ isLoading: true });
      this.setState({ isSaving: true });
      this.setState({ doc });
    };

    const updatedProps = {
      ...this.props,
      fields: [],
      save,
      onChange: onLeadChange,
      isActionLoading: this.state.isLoading,
      isSaving: this.state.isSaving
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
    >(gql(mutations.integrationsCreateLeadIntegration), {
      name: 'addIntegrationMutation',
      options: {
        refetchQueries: ['leadIntegrations', 'leadIntegrationCounts']
      }
    }),
    graphql<{}, AddLeadMutationResponse, AddLeadMutationVariables>(
      gql(mutations.addLead),
      {
        name: 'addLeadMutation'
      }
    )
  )(withRouter<Props>(CreateLeadContainer))
);
