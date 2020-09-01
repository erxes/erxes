import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { Alert, withProps } from 'modules/common/utils';
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

type Props = {} & IRouterProps &
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
  };
};

class CreateLeadContainer extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = { isLoading: false, isReadyToSaveForm: false };
  }

  render() {
    const { addIntegrationMutation, history } = this.props;
    const afterFormDbSave = id => {
      this.setState({ isReadyToSaveForm: false });

      if (this.state.doc) {
        const { leadData, brandId, name, languageCode } = this.state.doc;

        addIntegrationMutation({
          variables: {
            formId: id,
            leadData,
            brandId,
            name,
            languageCode
          }
        })
          .then(({ data : { integrationsCreateLeadIntegration: { _id }} }) => {
            Alert.success('You successfully added a lead');

            history.push({
              pathname: '/leads',
              search: `?popUpRefetchList=true&showInstallCode=${_id}`,
            });
          })

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
      isReadyToSaveForm: this.state.isReadyToSaveForm
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
    })
  )(withRouter<Props>(CreateLeadContainer))
);
