import client from 'apolloClient';
import gql from 'graphql-tag';
import { IRouterProps } from 'modules/common/types';
import { Alert, withProps } from 'modules/common/utils';
import Facebook from 'modules/settings/integrations/components/facebook/Form';
import { mutations, queries } from 'modules/settings/integrations/graphql';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { withRouter } from 'react-router';

import { IPages } from '../../types';

type Props = {
  type?: string;
  closeModal: () => void;
};

type CreateFacebookMutationVariables = {
  name: string;
  brandId: string;
  data: {
    pageIds: string[];
  };
};

type CreateFacebookMutationResponse = {
  saveMutation: (
    params: {
      variables: CreateFacebookMutationVariables & {
        accountId: string;
        kind: string;
      };
    }
  ) => Promise<any>;
};

type FinalProps = {} & IRouterProps & Props & CreateFacebookMutationResponse;

type State = {
  pages: IPages[];
  accountId?: string;
};

class FacebookContainer extends React.Component<FinalProps, State> {
  constructor(props: FinalProps) {
    super(props);

    this.state = { pages: [] };
  }

  onAccountSelect = (accountId?: string) => {
    if (!accountId) {
      return this.setState({ pages: [], accountId: '' });
    }

    client
      .query({
        query: gql(queries.fetchApi),
        variables: {
          path: '/facebook/get-pages',
          params: { accountId }
        }
      })
      .then(({ data, loading }: any) => {
        if (!loading) {
          this.setState({
            pages: data.integrationsFetchApi,
            accountId
          });
        }
      })
      .catch(error => {
        Alert.error(error.message);
      });
  };

  onRemoveAccount = () => {
    this.setState({ pages: [] });
  };

  onSave = (
    variables: CreateFacebookMutationVariables,
    callback: () => void
  ) => {
    const { history, saveMutation } = this.props;
    const { accountId } = this.state;

    if (!accountId) {
      return;
    }

    saveMutation({ variables: { ...variables, kind: 'facebook', accountId } })
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
      pages: this.state.pages,
      onAccountSelect: this.onAccountSelect,
      onRemoveAccount: this.onRemoveAccount,
      onSave: this.onSave
    };

    return <Facebook {...updatedProps} />;
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
  )(withRouter<FinalProps>(FacebookContainer))
);
