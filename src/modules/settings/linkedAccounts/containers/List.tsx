import gql from 'graphql-tag';
import { __, Alert, withProps } from 'modules/common/utils';
import {
  GetGoogleAuthUrlQueryResponse,
  GetTwitterAuthUrlQueryResponse,
  TwitterAuthParams
} from 'modules/settings/integrations/types';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { List } from '../components';
import { mutations, queries } from '../graphql';
import {
  AccountsQueryResponse,
  LinkGmailMutationResponse,
  LinkTwitterMutationResponse,
  RemoveMutationResponse
} from '../types';

type Props = {
  accountsQuery: AccountsQueryResponse;
  twitterAuthUrlQuery: GetTwitterAuthUrlQueryResponse;
  gmailAuthUrlQuery: GetGoogleAuthUrlQueryResponse;
  queryParams: any;
  history: any;
} & RemoveMutationResponse &
  LinkTwitterMutationResponse &
  LinkGmailMutationResponse;

class ListContainer extends React.Component<Props> {
  componentDidMount() {
    const {
      queryParams,
      accountsAddTwitter,
      accountsAddGmail,
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

    if (queryParams && queryParams.code) {
      accountsAddGmail({
        variables: { code: queryParams.code }
      })
        .then(() => {
          history.push('/settings/linkedAccounts');
          Alert.success('Success');
        })
        .catch(() => {
          history.push('/settings/linkedAccounts');
          Alert.error('Error');
        });
    }
  }

  render() {
    const {
      accountsQuery,
      removeAccount,
      twitterAuthUrlQuery,
      gmailAuthUrlQuery
    } = this.props;

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
      twitterAuthUrl: twitterAuthUrlQuery.integrationGetTwitterAuthUrl || '',
      gmailAuthUrl: gmailAuthUrlQuery.integrationGetGoogleAuthUrl || ''
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
      {
        name: 'twitterAuthUrlQuery'
      }
    ),
    graphql<Props, GetGoogleAuthUrlQueryResponse>(
      gql`
        query integrationGetGoogleAuthUrl {
          integrationGetGoogleAuthUrl(service: "gmail")
        }
      `,
      { name: 'gmailAuthUrlQuery' }
    ),
    graphql<
      Props,
      LinkTwitterMutationResponse,
      { queryParams: TwitterAuthParams }
    >(gql(mutations.linkTwitterAccount), {
      name: 'accountsAddTwitter',
      options: {
        refetchQueries: ['accounts']
      }
    }),
    graphql<Props, LinkGmailMutationResponse, { code: string }>(
      gql(mutations.linkGmailAccount),
      {
        name: 'accountsAddGmail',
        options: {
          refetchQueries: ['accounts']
        }
      }
    )
  )(ListContainer)
);
