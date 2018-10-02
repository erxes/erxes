import gql from 'graphql-tag';
import { Spinner } from 'modules/common/components';
import { Alert } from 'modules/common/utils';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { Gmail } from '../../components/google';

type Props = {
  type: string;
  history: any;
  queryParams: any;
  googleAuthUrlQuery: any;
  saveMutation: (params: {variables: { code: string }}) => Promise<any>;
};

const GmailContainer = (props: Props) => {
  const {
    history,
    type,
    saveMutation,
    googleAuthUrlQuery,
    queryParams
  } = props;

  const authUrl =
    googleAuthUrlQuery && googleAuthUrlQuery.integrationGetGoogleAuthUrl;

  if (type === 'link' && authUrl) {
    window.location.href = authUrl;
    return <Spinner />;
  }

  const save = () => {
    saveMutation({
      variables: {
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

  return <Gmail save={save} />;
};

export default compose(
  graphql(
    gql`
      query integrationGetGoogleAuthUrl($service: String) {
        integrationGetGoogleAuthUrl(service: $service)
      }
    `,
    {
      name: 'googleAuthUrlQuery',
      options: () => ({
        variables: { service: 'gmail' }
      })
    }
  ),
  graphql(
    gql`
      mutation integrationsCreateGmailIntegration(
        $code: String!
      ) {
        integrationsCreateGmailIntegration(code: $code) {
          _id
        }
      }
    `,
    { name: 'saveMutation' }
  )
)(GmailContainer);
