import gql from 'graphql-tag';
import { Spinner } from 'modules/common/components';
import { Alert, withProps } from 'modules/common/utils';
import { queries } from 'modules/settings/integrations/graphql';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { Calendar as DumbCalendar } from '../../components/google';
import {
  GetGoogleAccessTokenQueryResponse,
  GetGoogleAuthUrlQueryResponse,
  GoogleAccessTokenQueryResponse,
  messengerAppsAddGoogleMeetMutationResponse
} from '../../types';

type Props = {
  type: string;
  history: any;
  queryParams: any;
};

type FinalProps = {
  googleAuthUrlQuery: GetGoogleAuthUrlQueryResponse;
  googleAccessTokenQuery: GoogleAccessTokenQueryResponse;
} & messengerAppsAddGoogleMeetMutationResponse &
  Props;

const Calendar = (props: FinalProps) => {
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

  return <DumbCalendar save={save} />;
};

export default withProps<Props>(
  compose(
    graphql<Props, GetGoogleAuthUrlQueryResponse>(
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
    graphql<Props, GetGoogleAccessTokenQueryResponse>(
      gql`
        query integrationGetGoogleAccessToken($code: String) {
          integrationGetGoogleAccessToken(code: $code)
        }
      `,
      {
        name: 'googleAccessTokenQuery',
        skip: ({ queryParams }) => !queryParams.code,
        options: ({ queryParams }: { queryParams: any }) => ({
          variables: { code: queryParams.code }
        })
      }
    ),
    graphql<Props, messengerAppsAddGoogleMeetMutationResponse>(
      gql`
        mutation messengerAppsAddGoogleMeet(
          $name: String!
          $credentials: JSON
        ) {
          messengerAppsAddGoogleMeet(name: $name, credentials: $credentials) {
            _id
          }
        }
      `,
      {
        name: 'saveMutation',
        options: () => {
          return {
            refetchQueries: [
              {
                query: gql(queries.messengerApps),
                variables: { kind: 'googleMeet' }
              },
              {
                query: gql(queries.messengerAppsCount),
                variables: { kind: 'googleMeet' }
              }
            ]
          };
        }
      }
    )
  )(Calendar)
);
