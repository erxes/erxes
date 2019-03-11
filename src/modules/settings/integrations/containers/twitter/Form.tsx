import gql from 'graphql-tag';
import { Spinner } from 'modules/common/components';
import { Alert, withProps } from 'modules/common/utils';
import Twitter from 'modules/settings/integrations/components/twitter/Form';
import { queries } from 'modules/settings/linkedAccounts/graphql';
import { AccountsQueryResponse } from 'modules/settings/linkedAccounts/types';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { BrandsQueryResponse } from '../../../brands/types';
import {
  GetTwitterAuthUrlQueryResponse,
  SaveTwitterMutationResponse
} from '../../types';

type Props = {
  twitterAuthUrlQuery: GetTwitterAuthUrlQueryResponse;
};

type FinalProps = {
  brandsQuery: BrandsQueryResponse;
  accountsQuery: AccountsQueryResponse;
} & Props &
  SaveTwitterMutationResponse;

const TwitterContainer = (props: FinalProps) => {
  const {
    brandsQuery,
    saveMutation,
    accountsQuery,
    twitterAuthUrlQuery
  } = props;

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

  const updatedProps = {
    ...props,
    brands,
    save,
    accounts,
    twitterAuthUrl: twitterAuthUrlQuery.integrationGetTwitterAuthUrl || ''
  };

  return <Twitter {...updatedProps} />;
};

export default withProps<Props>(
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
      gql`
        query integrationGetTwitterAuthUrl {
          integrationGetTwitterAuthUrl
        }
      `,
      {
        name: 'twitterAuthUrlQuery'
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
      SaveTwitterMutationResponse,
      { brandId: string; accountId: string }
    >(
      gql`
        mutation save($brandId: String!, $accountId: String!) {
          integrationsCreateTwitterIntegration(
            brandId: $brandId
            accountId: $accountId
          ) {
            _id
          }
        }
      `,
      {
        name: 'saveMutation'
      }
    )
  )(TwitterContainer)
);
