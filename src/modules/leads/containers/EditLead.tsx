import gql from 'graphql-tag';
import { Alert, withProps } from 'modules/common/utils';
import {
  EditIntegrationMutationResponse,
  EditIntegrationMutationVariables,
  LeadIntegrationDetailQueryResponse
} from 'modules/settings/integrations/types';
import React from 'react';
import { compose, graphql } from 'react-apollo';
import { withRouter } from 'react-router';
import { IRouterProps } from '../../common/types';
import Lead from '../components/Lead';
import { mutations, queries } from '../graphql';
import { ILeadData } from '../types';

type Props = {
  contentTypeId: string;
  formId: string;
  queryParams: any;
};

type State = {
  isLoading: boolean;
  isReadyToSaveForm: boolean;
  doc?: {
    brandId: string;
    name: string;
    languageCode: string;
    lead: any;
    leadData: ILeadData;
  };
};

type FinalProps = {
  integrationDetailQuery: LeadIntegrationDetailQueryResponse;
} & Props &
  EditIntegrationMutationResponse &
  IRouterProps;

class EditLeadContainer extends React.Component<FinalProps, State> {
  constructor(props: FinalProps) {
    super(props);

    this.state = { isLoading: false, isReadyToSaveForm: false };
  }

  render() {
    const {
      formId,
      integrationDetailQuery,
      editIntegrationMutation,
      history
    } = this.props;

    if (integrationDetailQuery.loading) {
      return false;
    }

    const integration = integrationDetailQuery.integrationDetail || {};

    const afterFormDbSave = () => {
      if (this.state.doc) {
        const { leadData, brandId, name, languageCode } = this.state.doc;

        editIntegrationMutation({
          variables: {
            _id: integration._id,
            formId,
            leadData,
            brandId,
            name,
            languageCode
          }
        })
          .then(() => {
            Alert.success('You successfully updated a lead');

            history.push('/leads');

            this.setState({ isReadyToSaveForm: false, isLoading: false });
          })

          .catch(error => {
            Alert.error(error.message);

            this.setState({ isReadyToSaveForm: false, isLoading: false });
          });
      }
    };

    const save = doc => {
      this.setState({ isLoading: true, isReadyToSaveForm: true, doc });
    };

    const updatedProps = {
      ...this.props,
      integration,
      save,
      afterFormDbSave,
      isActionLoading: this.state.isLoading,
      isReadyToSaveForm: this.state.isReadyToSaveForm
    };

    return <Lead {...updatedProps} />;
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
    })
  )(withRouter<FinalProps>(EditLeadContainer))
);
