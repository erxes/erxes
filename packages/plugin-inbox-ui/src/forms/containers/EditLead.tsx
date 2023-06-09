import * as compose from 'lodash.flowright';

import { Alert, withProps } from '@erxes/ui/src/utils';
import {
  EditIntegrationMutationResponse,
  EditIntegrationMutationVariables,
  LeadIntegrationDetailQueryResponse
} from '@erxes/ui-inbox/src/settings/integrations/types';
import { mutations, queries } from '@erxes/ui-leads/src/graphql';

import { ConfigsQueryResponse } from '@erxes/ui-settings/src/general/types';
import { ILeadData } from '@erxes/ui-leads/src/types';
import { ILeadIntegration } from '@erxes/ui-leads/src/types';
import { IRouterProps } from '@erxes/ui/src/types';
import Lead from '../components/Lead';
import React from 'react';
import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';
import { isEnabled } from '@erxes/ui/src/utils/core';
import { queries as settingsQueries } from '@erxes/ui-settings/src/general/graphql';
import { withRouter } from 'react-router-dom';

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
    visibility?: string;
    departmentIds?: string[];
  };
};

type FinalProps = {
  integrationDetailQuery: LeadIntegrationDetailQueryResponse;
  emailTemplatesQuery: any /*change type*/;
  emailTemplatesTotalCountQuery: any /*change type*/;
  configsQuery: ConfigsQueryResponse;
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
      emailTemplatesQuery,
      configsQuery
    } = this.props;

    if (integrationDetailQuery.loading) {
      return false;
    }

    const integration =
      integrationDetailQuery.integrationDetail || ({} as ILeadIntegration);

    const afterFormDbSave = () => {
      if (this.state.doc) {
        const {
          leadData,
          brandId,
          name,
          languageCode,
          channelIds,
          visibility,
          departmentIds
        } = this.state.doc;

        editIntegrationMutation({
          variables: {
            _id: integration._id,
            formId,
            leadData,
            brandId,
            name,
            languageCode,
            channelIds,
            visibility,
            departmentIds
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
      integration: integration ? integration : ({} as any),
      save,
      afterFormDbSave,
      isActionLoading: this.state.isLoading,
      isReadyToSaveForm: this.state.isReadyToSaveForm,
      emailTemplates: emailTemplatesQuery
        ? emailTemplatesQuery.emailTemplates || []
        : [],
      configs: configsQuery.configs || []
    };

    return <Lead {...updatedProps} />;
  }
}

const withTemplatesQuery = withProps<FinalProps>(
  compose(
    graphql<FinalProps>(gql(queries.emailTemplates), {
      name: 'emailTemplatesQuery',
      options: ({ emailTemplatesTotalCountQuery }) => ({
        variables: {
          perPage: emailTemplatesTotalCountQuery.emailTemplatesTotalCount
        }
      }),
      skip: !isEnabled('engages') ? true : false
    })
  )(EditLeadContainer)
);

export default withProps<FinalProps>(
  compose(
    graphql(gql(queries.templateTotalCount), {
      name: 'emailTemplatesTotalCountQuery',
      skip: !isEnabled('engages') ? true : false
    }),
    graphql<Props, LeadIntegrationDetailQueryResponse, { _id: string }>(
      gql(queries.integrationDetail),
      {
        name: 'integrationDetailQuery',
        options: ({ contentTypeId }) => ({
          fetchPolicy: 'cache-and-network',
          variables: {
            _id: contentTypeId
          }
        })
      }
    ),
    graphql<{}, ConfigsQueryResponse>(gql(settingsQueries.configs), {
      name: 'configsQuery'
    }),
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
