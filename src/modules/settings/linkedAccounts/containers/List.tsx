import gql from 'graphql-tag';
import { __, Alert, withProps } from 'modules/common/utils';
import {
  GetTwitterAuthUrlQueryResponse,
  TwitterAuthParams
} from 'modules/settings/integrations/types';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { List } from '../components';
import { mutations, queries } from '../graphql';
import {
  AccountsQueryResponse,
  LinkTwitterMutationResponse,
  RemoveMutationResponse
} from '../types';

type Props = {
  accountsQuery: AccountsQueryResponse;
  twitterAuthUrlQuery: GetTwitterAuthUrlQueryResponse;
  queryParams: TwitterAuthParams;
  history: any;
} & RemoveMutationResponse &
  LinkTwitterMutationResponse;

class ListContainer extends React.Component<Props> {
  render() {
    const {
      accountsQuery,
      removeAccount,
      twitterAuthUrlQuery,
      queryParams,
      accountsAddTwitter,
      history
    } = this.props;

    if (
      queryParams &&
      (queryParams.oauth_token && queryParams.oauth_verifier)
    ) {
      accountsAddTwitter({ queryParams })
        .then(() => {
          history.push('/settings/linkedAccounts');
          Alert.success('Success');
        })
        .catch(() => {
          history.push('/settings/linkedAccounts');
          Alert.error('Error');
        });
    }

    const delink = (accountId: string) => {
      removeAccount({
        variables: { _id: accountId }
      })
        .then(() => {
          Alert.success('Success');
        })
        .catch(e => {
          Alert.error(e.message);
        });
    };

    const updatedProps = {
      accounts: accountsQuery.accounts || [],
      delink,
      twitterAuthUrl: twitterAuthUrlQuery.integrationGetTwitterAuthUrl || ''
    };

    return <List {...updatedProps} />;
  }
}

export default withProps<{
  queryParams: { [key: string]: string };
  history: any;
}>(
  compose(
    graphql<Props, AccountsQueryResponse>(gql(queries.accounts), {
      name: 'accountsQuery'
    }),
    graphql<Props, RemoveMutationResponse, { _id: string }>(
      gql(mutations.delinkAccount),
      {
        name: 'removeAccount',
        options: {
          refetchQueries: ['accounts']
        }
      }
    ),
    graphql<Props, GetTwitterAuthUrlQueryResponse>(
      gql`
        query integrationGetTwitterAuthUrl {
          integrationGetTwitterAuthUrl
        }
      `,
      { name: 'twitterAuthUrlQuery' }
    ),
    graphql<
      Props,
      LinkTwitterMutationResponse,
      { queryParams: TwitterAuthParams }
    >(gql(mutations.linkTwitterAccount), {
      name: 'accountsAddTwitter'
    })
  )(ListContainer)
);
