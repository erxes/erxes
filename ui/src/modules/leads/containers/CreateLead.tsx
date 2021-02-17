import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { Alert, withProps } from 'modules/common/utils';
import { EmailTemplatesQueryResponse } from 'modules/settings/emailTemplates/containers/List';
import { queries as templatesQuery } from 'modules/settings/emailTemplates/graphql';
import {
  AddIntegrationMutationResponse,
  AddIntegrationMutationVariables
} from 'modules/settings/integrations/types';
import { AddFieldsMutationResponse } from 'modules/settings/properties/types';
import React from 'react';
import { graphql } from 'react-apollo';
import { withRouter } from 'react-router-dom';
import { IRouterProps } from '../../common/types';
import Lead from '../components/Lead';
import { mutations } from '../graphql';
import { ILeadData } from '../types';

type Props = {
  emailTemplatesQuery: EmailTemplatesQueryResponse;
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
    const { addIntegrationMutation, history, emailTemplatesQuery } = this.props;
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
      emailTemplates: emailTemplatesQuery.emailTemplates || []
    };

    return <Lead {...updatedProps} />;
  }
}

export default withProps<{}>(
  compose(
    graphql<
      {},
      AddIntegrationMutationResponse,
      AddIntegrationMutationVariables
    >(gql(mutations.integrationsCreateLeadIntegration), {
      name: 'addIntegrationMutation'
    }),
    graphql<Props, EmailTemplatesQueryResponse>(
      gql(templatesQuery.emailTemplates),
      {
        name: 'emailTemplatesQuery',
        options: () => ({
          variables: { page: 1 }
        })
      }
    )
  )(withRouter<Props>(CreateLeadContainer))
);
