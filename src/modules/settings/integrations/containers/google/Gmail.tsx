import gql from 'graphql-tag';
import { Spinner } from 'modules/common/components';
import { IRouterProps } from 'modules/common/types';
import { Alert, withProps } from 'modules/common/utils';
import { queries as brandQueries } from 'modules/settings/brands/graphql';
import Gmail from 'modules/settings/integrations/components/google/Gmail';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { mutations } from '../../graphql';
import {
  CreateGmailMutationResponse,
  CreateGmailMutationVariables
} from '../../types';

type Props = {
  type?: string;
  closeModal: () => void;
};

type FinalProps = {
  queryParams: any;
} & IRouterProps &
  Props &
  CreateGmailMutationResponse;

class GmailContainer extends React.Component<FinalProps> {
  render() {
    const { saveMutation, closeModal } = this.props;

    const save = (
      variables: CreateGmailMutationVariables,
      callback: () => void
    ) => {
      saveMutation({ variables })
        .then(() => {
          Alert.success('You successfully added an integration');
          callback();
        })
        .catch(e => {
          Alert.error(e.message);
        });
    };

    const updatedProps = {
      closeModal,
      save
    };

    return <Gmail {...updatedProps} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props, CreateGmailMutationResponse, CreateGmailMutationVariables>(
      gql(mutations.integrationsCreateGmailIntegration),
      { name: 'saveMutation' }
    )
  )(GmailContainer)
);
