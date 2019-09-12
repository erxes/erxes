import gql from 'graphql-tag';
import { Alert, withProps } from 'modules/common/utils';
import {
  AddIntegrationMutationResponse,
  AddIntegrationMutationVariables
} from 'modules/settings/integrations/types';
import { AddFieldsMutationResponse } from 'modules/settings/properties/types';
import React from 'react';
import { compose, graphql } from 'react-apollo';
import { withRouter } from 'react-router';
import { IRouterProps } from '../../common/types';
import Lead from '../components/Lead';
import { mutations } from '../graphql';
import { ILeadData } from '../types';

type Props = {} & IRouterProps &
  AddIntegrationMutationResponse &
  AddFieldsMutationResponse;

type State = {
  isLoading: boolean;
  isSaving: boolean;
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

    this.state = { isLoading: false, isSaving: false };
  }

  render() {
    const { addIntegrationMutation, history } = this.props;

    const onLeadChange = id => {
      this.setState({ isSaving: false });

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
      this.setState({ isLoading: true, isSaving: true, doc });
    };

    const updatedProps = {
      ...this.props,
      fields: [],
      save,
      onChange: onLeadChange,
      isActionLoading: this.state.isLoading,
      isSaving: this.state.isSaving
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
      name: 'addIntegrationMutation',
      options: {
        refetchQueries: ['leadIntegrations', 'leadIntegrationCounts']
      }
    })
  )(withRouter<Props>(CreateLeadContainer))
);
