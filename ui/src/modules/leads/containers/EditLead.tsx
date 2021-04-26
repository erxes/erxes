import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { Alert, withProps } from 'modules/common/utils';
import {
  EmailTemplatesQueryResponse,
  EmailTemplatesTotalCountQueryResponse
} from 'modules/settings/emailTemplates/containers/List';
import { queries as templatesQuery } from 'modules/settings/emailTemplates/graphql';
import {
  EditIntegrationMutationResponse,
  EditIntegrationMutationVariables,
  LeadIntegrationDetailQueryResponse
} from 'modules/settings/integrations/types';
import React from 'react';
import { graphql } from 'react-apollo';
import { withRouter } from 'react-router-dom';
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
    channelIds?: string[];
    name: string;
    languageCode: string;
    lead: any;
    leadData: ILeadData;
  };
};

type FinalProps = {
  integrationDetailQuery: LeadIntegrationDetailQueryResponse;
  emailTemplatesQuery: EmailTemplatesQueryResponse;
  emailTemplatesTotalCountQuery: EmailTemplatesTotalCountQueryResponse;
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
      history,
      emailTemplatesQuery
    } = this.props;

    if (integrationDetailQuery.loading) {
      return false;
    }

    const integration = integrationDetailQuery.integrationDetail || {};

    const afterFormDbSave = () => {
      if (this.state.doc) {
        const {
          leadData,
          brandId,
          name,
          languageCode,
          channelIds
        } = this.state.doc;

        editIntegrationMutation({
          variables: {
            _id: integration._id,
            formId,
            leadData,
            brandId,
            name,
            languageCode,
            channelIds
          }
        })
          .then(() => {
            Alert.success('You successfully updated a form');

            history.push({
              pathname: '/forms',
              search: '?popUpRefetchList=true'
            });
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
      isReadyToSaveForm: this.state.isReadyToSaveForm,
      emailTemplates: emailTemplatesQuery.emailTemplates || []
    };

    return <Lead {...updatedProps} />;
  }
}

const withTemplatesQuery = withProps<FinalProps>(
  compose(
    graphql<FinalProps, EmailTemplatesQueryResponse>(
      gql(templatesQuery.emailTemplates),
      {
        name: 'emailTemplatesQuery',
        options: ({ emailTemplatesTotalCountQuery }) => ({
          variables: {
            perPage: emailTemplatesTotalCountQuery.emailTemplatesTotalCount
          }
        })
      }
    )
  )(EditLeadContainer)
);

export default withProps<FinalProps>(
  compose(
    graphql(gql(templatesQuery.totalCount), {
      name: 'emailTemplatesTotalCountQuery'
    }),
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
  )(withRouter<FinalProps>(withTemplatesQuery))
);
