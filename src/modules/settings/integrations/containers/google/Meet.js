import React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Spinner } from 'modules/common/components';
import { Alert } from 'modules/common/utils';
import DumbMeet from 'modules/settings/integrations/components/google/Meet';

const Meet = props => {
  const {
    history,
    type,
    saveMutation,
    googleAuthUrlQuery,
    googleAccessTokenQuery
  } = props;

  const authUrl =
    googleAuthUrlQuery && googleAuthUrlQuery.integrationGetGoogleAuthUrl;

  if (type === 'link' && authUrl) {
    window.location.href = authUrl;
    return <Spinner />;
  }

  if (type === 'form' && googleAccessTokenQuery.loading) {
    return <Spinner />;
  }

  const save = variables => {
    const credentials = googleAccessTokenQuery.integrationGetGoogleAccessToken;

    if (!credentials) {
      return Alert.error('Invalid grant');
    }

    saveMutation({
      variables: {
        ...variables,
        kind: 'googleMeet',
        credentials
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

  return <DumbMeet save={save} />;
};

Meet.propTypes = {
  type: PropTypes.string,
  history: PropTypes.object,
  queryParams: PropTypes.object,
  googleAuthUrlQuery: PropTypes.object,
  googleAccessTokenQuery: PropTypes.object,
  saveMutation: PropTypes.func
};

export default compose(
  graphql(
    gql`
      query integrationGetGoogleAuthUrl {
        integrationGetGoogleAuthUrl
      }
    `,
    {
      name: 'googleAuthUrlQuery',
      skip: ({ type }) => type === 'form'
    }
  ),
  graphql(
    gql`
      query integrationGetGoogleAccessToken($code: String) {
        integrationGetGoogleAccessToken(code: $code)
      }
    `,
    {
      name: 'googleAccessTokenQuery',
      skip: ({ queryParams }) => !queryParams.code,
      options: ({ queryParams }) => ({
        variables: { code: queryParams.code }
      })
    }
  ),
  graphql(
    gql`
      mutation messengerAppsAdd(
        $kind: String!
        $name: String!
        $credentials: JSON
      ) {
        messengerAppsAdd(kind: $kind, name: $name, credentials: $credentials) {
          _id
        }
      }
    `,
    { name: 'saveMutation' }
  )
)(Meet);
