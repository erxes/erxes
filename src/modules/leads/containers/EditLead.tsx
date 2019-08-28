import gql from 'graphql-tag';
import { Alert, withProps } from 'modules/common/utils';
import {
  EditIntegrationMutationResponse,
  EditIntegrationMutationVariables,
  ILeadData,
  LeadIntegrationDetailQueryResponse
} from 'modules/settings/integrations/types';
import React from 'react';
import { compose, graphql } from 'react-apollo';
import { withRouter } from 'react-router';
import { IRouterProps } from '../../common/types';
import Form from '../components/Form';
import { mutations, queries } from '../graphql';
import {
  EditLeadMutationResponse,
  EditLeadMutationVariables,
  ILead
} from '../types';

type Props = {
  contentTypeId: string;
  formId: string;
  leadId: string;
  queryParams: any;
};

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

type FinalProps = {
  integrationDetailQuery: LeadIntegrationDetailQueryResponse;
} & Props &
  EditIntegrationMutationResponse &
  EditLeadMutationResponse &
  IRouterProps;

class EditLeadContainer extends React.Component<FinalProps, State> {
  constructor(props: FinalProps) {
    super(props);

    this.state = { isLoading: false, isSaving: false };
  }

  render() {
    const {
      leadId,
      formId,
      integrationDetailQuery,
      editIntegrationMutation,
      editLeadMutation,
      history
    } = this.props;

    if (integrationDetailQuery.loading) {
      return false;
    }

    const integration = integrationDetailQuery.integrationDetail || {};

    const onLeadEdit = () => {
      this.setState({ isSaving: false });

      if (this.state.doc) {
        const { lead, leadData, brandId, name, languageCode } = this.state.doc;

        editLeadMutation({
          variables: {
            _id: leadId,
            formId,
            themeColor: lead.themeColor,
            callout: lead.callout,
            rules: lead.rules
          }
        })
          .then(() =>
            // edit integration
            editIntegrationMutation({
              variables: {
                _id: integration._id,
                leadData,
                brandId,
                name,
                languageCode,
                leadId
              }
            })
          )

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
      integration,
      save,
      onChange: onLeadEdit,
      isActionLoading: this.state.isLoading,
      isSaving: this.state.isLoading
    };

    return <Form {...updatedProps} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props, LeadIntegrationDetailQueryResponse, { _id: string }>(
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
    >(gql(mutations.integrationsEditLeadIntegration), {
      name: 'editIntegrationMutation',
      options: {
        refetchQueries: [
          'leadIntegrations',
          'leadIntegrationCounts',
          'formDetail'
        ]
      }
    }),
    graphql<Props, EditLeadMutationResponse, EditLeadMutationVariables>(
      gql(mutations.editLead),
      {
        name: 'editLeadMutation'
      }
    )
  )(withRouter<FinalProps>(EditLeadContainer))
);
