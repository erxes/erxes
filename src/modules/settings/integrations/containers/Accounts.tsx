import { getEnv } from 'apolloClient';
import gql from 'graphql-tag';
import Spinner from 'modules/common/components/Spinner';
import { IFormProps } from 'modules/common/types';
import { Alert, withProps } from 'modules/common/utils';
import { mutations, queries } from 'modules/settings/integrations/graphql';
import React from 'react';
import { compose, graphql } from 'react-apollo';
import Accounts from '../components/Accounts';
import { AccountsQueryResponse, RemoveAccountMutationResponse } from '../types';

type Props = {
  kind: 'facebook' | 'gmail' | 'nylas-gmail';
  addLink: string;
  onSelect: (accountId?: string) => void;
  onRemove: (accountId: string) => void;
  formProps: IFormProps;
};

type FinalProps = {
  fetchApiQuery: AccountsQueryResponse;
} & Props &
  RemoveAccountMutationResponse;

class AccountContainer extends React.Component<FinalProps, {}> {
  onAdd = () => {
    const { addLink, kind } = this.props;

    const { REACT_APP_API_URL } = getEnv();
    const url = `${REACT_APP_API_URL}/connect-integration?link=${addLink}&kind=${kind}`;

    window.location.replace(url);
  };

  removeAccount = (accountId: string) => {
    const { removeAccount, onRemove } = this.props;

    removeAccount({ variables: { _id: accountId } })
      .then(() => {
        Alert.success('You successfully removed an account');
        onRemove(accountId);
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  render() {
    const { fetchApiQuery, onSelect, formProps } = this.props;

    if (fetchApiQuery.loading) {
      return <Spinner objective={true} />;
    }

    if (fetchApiQuery.error) {
      return (
        <span style={{ color: 'red' }}>Integrations api is not running</span>
      );
    }

    const accounts = fetchApiQuery.integrationsFetchApi || [];

    return (
      <Accounts
        onAdd={this.onAdd}
        removeAccount={this.removeAccount}
        onSelect={onSelect}
        accounts={accounts}
        formProps={formProps}
      />
    );
  }
}

export default withProps<Props>(
  compose(
    graphql<Props, RemoveAccountMutationResponse, { _id: string }>(
      gql(mutations.removeAccount),
      {
        name: 'removeAccount',
        options: {
          refetchQueries: ['integrationsFetchApi']
        }
      }
    ),
    graphql<Props, AccountsQueryResponse>(gql(queries.fetchApi), {
      name: 'fetchApiQuery',
      options: ({ kind }) => ({
        variables: {
          path: '/accounts',
          params: { kind }
        }
      })
    })
  )(AccountContainer)
);
