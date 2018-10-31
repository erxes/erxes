import gql from 'graphql-tag';
import { Spinner } from 'modules/common/components';
import { Alert, withProps } from 'modules/common/utils';
import { queries as brandsQueries } from 'modules/settings/brands/graphql';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { BrandsQueryResponse } from '../../../brands/types';
import { Gmail } from '../../components/google';
import { mutations, queries as integrationsQueries } from '../../graphql';
import {
  CreateGmailMutationResponse,
  GetGoogleAuthUrlQueryResponse
} from '../../types';

type Props = {
  type: string;
  history: any;
  queryParams: any;
};

type FinalProps = {
  brandsQuery: BrandsQueryResponse;
  googleAuthUrlQuery: GetGoogleAuthUrlQueryResponse;
} & Props &
  CreateGmailMutationResponse;

const GmailContainer = (props: FinalProps) => {
  const {
    history,
    type,
    saveMutation,
    googleAuthUrlQuery,
    brandsQuery,
    queryParams
  } = props;

  if (brandsQuery.loading) {
    return <Spinner objective={true} />;
  }

  const authUrl =
    googleAuthUrlQuery && googleAuthUrlQuery.integrationGetGoogleAuthUrl;
  const brands = brandsQuery.brands || [];

  if (type === 'link' && authUrl) {
    window.location.href = authUrl;
    return <Spinner />;
  }

  const save = variables => {
    saveMutation({
      variables: {
        ...variables,
        code: queryParams.code
      }
    })
      .then(() => {
        Alert.success('Congrats');
        history.push('/settings/integrations');
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  return <Gmail save={save} brands={brands} />;
};

export default withProps<Props>(
  compose(
    graphql<Props, BrandsQueryResponse>(gql(brandsQueries.brands), {
      name: 'brandsQuery',
      options: () => ({
        fetchPolicy: 'network-only'
      })
    }),
    graphql<Props, GetGoogleAuthUrlQueryResponse, { service: string }>(
      gql(integrationsQueries.integrationGetGoogleAuthUrl),
      {
        name: 'googleAuthUrlQuery',
        options: () => ({
          variables: { service: 'gmail' }
        })
      }
    ),
    graphql<Props, CreateGmailMutationResponse, { code: string }>(
      gql(mutations.integrationsCreateGmail),
      {
        name: 'saveMutation'
      }
    )
  )(GmailContainer)
);
