import gql from 'graphql-tag';
import { Spinner } from 'modules/common/components';
import { Alert } from 'modules/common/utils';
import { queries as brandsQueries } from 'modules/settings/brands/graphql';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { Gmail } from '../../components/google';
import { mutations, queries as integrationsQueries } from '../../graphql';

type Props = {
  type: string;
  history: any;
  queryParams: any;
  googleAuthUrlQuery: any;
  saveMutation: (params: { variables: { code: string } }) => Promise<any>;
  brandsQuery: any;
};

const GmailContainer = (props: Props) => {
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

export default compose(
  graphql(gql(brandsQueries.brands), {
    name: 'brandsQuery',
    options: () => ({
      fetchPolicy: 'network-only'
    })
  }),
  graphql(gql(integrationsQueries.integrationGetGoogleAuthUrl), {
    name: 'googleAuthUrlQuery',
    options: () => ({
      variables: { service: 'gmail' }
    })
  }),
  graphql(gql(mutations.integrationsCreateGmail), { name: 'saveMutation' })
)(GmailContainer);
