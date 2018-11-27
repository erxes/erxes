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
} & RemoveMutationResponse &
  LinkTwitterMutationResponse;

class ListContainer extends React.Component<Props> {
  render() {
    const { accountsQuery, removeAccount, twitterAuthUrlQuery } = this.props;

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

export default withProps<{}>(
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
