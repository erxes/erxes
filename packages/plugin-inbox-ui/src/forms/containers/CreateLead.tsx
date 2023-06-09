import * as compose from 'lodash.flowright';

import {
  AddIntegrationMutationResponse,
  AddIntegrationMutationVariables
} from '@erxes/ui-inbox/src/settings/integrations/types';
import { Alert, withProps } from '@erxes/ui/src/utils';
import { mutations, queries } from '@erxes/ui-leads/src/graphql';

import { AddFieldsMutationResponse } from '@erxes/ui-forms/src/settings/properties/types';
import { ConfigsQueryResponse } from '@erxes/ui-settings/src/general/types';
import { ILeadData } from '@erxes/ui-leads/src/types';
import { IRouterProps } from '@erxes/ui/src/types';
import Lead from '../components/Lead';
import React from 'react';
import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';
import { isEnabled } from '@erxes/ui/src/utils/core';
import { queries as settingsQueries } from '@erxes/ui-settings/src/general/graphql';
import { withRouter } from 'react-router-dom';

type Props = {
  emailTemplatesQuery: any /*change type*/;
  emailTemplatesTotalCountQuery: any /*change type*/;
  configsQuery: ConfigsQueryResponse;
} & IRouterProps &
  AddIntegrationMutationResponse &
  AddFieldsMutationResponse;

type State = {
  isLoading: boolean;
  isReadyToSaveForm: boolean;
  doc?: {
    brandId: string;
    name: string;
    languageCode: string;
    lead: any;
    leadData: ILeadData;
    channelIds?: string[];
  };
};

class CreateLeadContainer extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = { isLoading: false, isReadyToSaveForm: false };
  }

  render() {
    const {
      addIntegrationMutation,
      history,
      emailTemplatesQuery,
      configsQuery
    } = this.props;
    const afterFormDbSave = id => {
      this.setState({ isReadyToSaveForm: false });

      if (this.state.doc) {
        const {
          leadData,
          brandId,
          name,
          languageCode,
          channelIds
        } = this.state.doc;

        addIntegrationMutation({
          variables: {
            formId: id,
            leadData,
            brandId,
            name,
            languageCode,
            channelIds
          }
        })
          .then(
            ({
              data: {
                integrationsCreateLeadIntegration: { _id }
              }
            }) => {
              Alert.success('You successfully added a form');

              history.push({
                pathname: '/forms',
                search: `?popUpRefetchList=true&showInstallCode=${_id}`
              });
            }
          )

          .catch(error => {
            Alert.error(error.message);

            this.setState({ isLoading: false });
          });
      }
    };

    const save = doc => {
      this.setState({ isLoading: true, isReadyToSaveForm: true, doc });
    };

    const updatedProps = {
      ...this.props,
      fields: [],
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

const withTemplatesQuery = withProps<Props>(
  compose(
    graphql<Props>(gql(queries.emailTemplates), {
      name: 'emailTemplatesQuery',
      options: ({ emailTemplatesTotalCountQuery }) => ({
        variables: {
          perPage: emailTemplatesTotalCountQuery.emailTemplatesTotalCount
        }
      }),
      skip: !isEnabled('engages') ? true : false
    })
  )(CreateLeadContainer)
);

export default withProps<Props>(
  compose(
    graphql(gql(queries.templateTotalCount), {
      name: 'emailTemplatesTotalCountQuery',
      skip: !isEnabled('engages') ? true : false
    }),
    graphql<{}, ConfigsQueryResponse>(gql(settingsQueries.configs), {
      name: 'configsQuery'
    }),
    graphql<
      {},
      AddIntegrationMutationResponse,
      AddIntegrationMutationVariables
    >(gql(mutations.integrationsCreateLeadIntegration), {
      name: 'addIntegrationMutation'
    })
  )(withRouter<Props>(withTemplatesQuery))
);
