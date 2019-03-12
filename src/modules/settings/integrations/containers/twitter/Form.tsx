import gql from 'graphql-tag';
import { Spinner } from 'modules/common/components';
import { Alert, withProps } from 'modules/common/utils';
import Twitter from 'modules/settings/integrations/components/twitter/Form';
import { mutations, queries } from 'modules/settings/integrations/graphql';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { BrandsQueryResponse } from '../../../brands/types';
import {
  AccountsQueryResponse,
  GetTwitterAuthUrlQueryResponse,
  LinkTwitterMutationResponse,
  RemoveAccountMutationResponse,
  SaveTwitterMutationResponse,
  TwitterAuthParams
} from '../../types';

type Props = {
  twitterAuthUrlQuery: GetTwitterAuthUrlQueryResponse;
  queryParams: any;
  history: any;
} & RemoveAccountMutationResponse &
  LinkTwitterMutationResponse;

type FinalProps = {
  brandsQuery: BrandsQueryResponse;
  accountsQuery: AccountsQueryResponse;
} & Props &
  SaveTwitterMutationResponse;

class TwitterContainer extends React.Component<FinalProps> {
  componentDidMount() {
    const { accountsAddTwitter, queryParams, history } = this.props;

    if (
      queryParams &&
      (queryParams.oauth_token && queryParams.oauth_verifier)
    ) {
      accountsAddTwitter({ queryParams })
        .then(() => {
          history.push('/settings/integrations');
          Alert.success('Success');
        })
        .catch(() => {
          history.push('/settings/integrations');
          Alert.error('Error');
        });
    }
  }

  render() {
    const {
      brandsQuery,
      saveMutation,
      accountsQuery,
      twitterAuthUrlQuery,
      removeAccount
    } = this.props;

    if (brandsQuery.loading || accountsQuery.loading) {
      return <Spinner />;
    }

    const brands = brandsQuery.brands;
    const accounts = accountsQuery.accounts || [];

    const save = ({
      brandId,
      accountId
    }: {
      brandId: string;
      accountId: string;
    }) => {
      saveMutation({
        variables: {
          brandId,
          accountId
        }
      })
        .then(() => {
          Alert.success('Congrats');
        })
        .catch(e => {
          Alert.error(e.message);
        });
    };

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
      ...this.props,
      brands,
      save,
      accounts,
      delink,
      twitterAuthUrl: twitterAuthUrlQuery.integrationGetTwitterAuthUrl || ''
    };

    return <Twitter {...updatedProps} />;
  }
}

export default withProps<
  Props & {
    queryParams: { [key: string]: string };
    history: any;
  }
>(
  compose(
    graphql<Props, BrandsQueryResponse>(
      gql`
        query brands {
          brands {
            _id
            name
          }
        }
      `,
      {
        name: 'brandsQuery',
        options: () => ({
          fetchPolicy: 'network-only'
        })
      }
    ),
    graphql<Props, GetTwitterAuthUrlQueryResponse>(
      gql(queries.integrationGetTwitterAuthUrl),
      {
        name: 'twitterAuthUrlQuery'
      }
    ),
    graphql<Props, RemoveAccountMutationResponse, { _id: string }>(
      gql(mutations.delinkAccount),
      {
        name: 'removeAccount',
        options: {
          refetchQueries: ['accounts']
        }
      }
    ),
    graphql<Props, AccountsQueryResponse>(gql(queries.accounts), {
      name: 'accountsQuery',
      options: {
        variables: {
          kind: 'twitter'
        }
      }
    }),
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
    graphql<
      Props,
      SaveTwitterMutationResponse,
      { brandId: string; accountId: string }
    >(gql(mutations.integrationsCreateTwitter), {
      name: 'saveMutation'
    })
  )(TwitterContainer)
);
