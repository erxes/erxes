import client from 'apolloClient';
import gql from 'graphql-tag';
import { IRouterProps } from 'modules/common/types';
import { Alert, withProps } from 'modules/common/utils';
import Gmail from 'modules/settings/integrations/components/google/Form';
import { mutations, queries } from 'modules/settings/integrations/graphql';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { withRouter } from 'react-router';

type Props = {
  type?: string;
  closeModal: () => void;
};

type CreateGmailMutationVariables = {
  name: string;
  brandId: string;
};

type CreateIntegrationMutationResponse = {
  saveMutation: (
    params: {
      variables: CreateGmailMutationVariables & {
        accountId: string;
        kind: string;
        data: {
          email: string;
        };
      };
    }
  ) => Promise<any>;
};

type FinalProps = {} & IRouterProps & Props & CreateIntegrationMutationResponse;

type State = {
  email: string;
  accountId?: string;
};

class GmailContainer extends React.Component<FinalProps, State> {
  constructor(props: FinalProps) {
    super(props);

    this.state = { email: '', accountId: '' };
  }

  onAccountSelect = (accountId?: string) => {
    if (!accountId) {
      return this.setState({ email: '', accountId: '' });
    }

    client
      .query({
        query: gql(queries.fetchApi),
        variables: {
          path: '/gmail/get-email',
          params: { accountId }
        }
      })
      .then(({ data, loading }: any) => {
        if (!loading) {
          this.setState({
            email: data.integrationsFetchApi,
            accountId
          });
        }
      })
      .catch(error => {
        Alert.error(error.message);
      });
  };

  onRemoveAccount = () => {
    this.setState({ email: '' });
  };

  onSave = (variables: CreateGmailMutationVariables, callback: () => void) => {
    const { history, saveMutation } = this.props;
    const { accountId, email } = this.state;

    if (!accountId) {
      return;
    }

    saveMutation({
      variables: {
        ...variables,
        kind: 'gmail',
        accountId,
        data: { email }
      }
    })
      .then(() => {
        callback();
        Alert.success('You successfully added a integration');
        history.push('/settings/integrations');
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  render() {
    const { closeModal } = this.props;

    const updatedProps = {
      closeModal,
      email: this.state.email,
      onAccountSelect: this.onAccountSelect,
      onRemoveAccount: this.onRemoveAccount,
      onSave: this.onSave
    };

    return <Gmail {...updatedProps} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props>(gql(mutations.integrationsCreateExternalIntegration), {
      name: 'saveMutation',
      options: () => {
        return {
          refetchQueries: [
            {
              query: gql(queries.integrations)
            },
            {
              query: gql(queries.integrationTotalCount)
            }
          ]
        };
      }
    })
  )(withRouter<FinalProps>(GmailContainer))
);
