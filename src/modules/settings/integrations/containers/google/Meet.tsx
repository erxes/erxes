import gql from 'graphql-tag';
import { IRouterProps } from 'modules/common/types';
import { Alert, withProps } from 'modules/common/utils';
import { queries } from 'modules/settings/integrations/graphql';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { withRouter } from 'react-router';
import { Meet as DumbMeet } from '../../components/google';
import {
  GetGoogleAuthUrlQueryResponse,
  messengerAppsAddGoogleMeetMutationResponse,
  MessengerAppsAddGoogleMeetMutationVariables
} from '../../types';

type Props = {
  type: string;
  history: any;
  gmailAuthUrlQuery: GetGoogleAuthUrlQueryResponse;
  closeModal: () => void;
};

type FinalProps = messengerAppsAddGoogleMeetMutationResponse &
  Props &
  IRouterProps;

const Meet = (props: FinalProps) => {
  const { history, saveMutation, gmailAuthUrlQuery, closeModal } = props;

  const save = (
    doc: MessengerAppsAddGoogleMeetMutationVariables,
    callback: () => void
  ) => {
    saveMutation({ variables: doc })
      .then(() => {
        callback();
        Alert.success('Congrats');
        history.push('/settings/integrations');
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  return (
    <DumbMeet
      save={save}
      closeModal={closeModal}
      gmailAuthUrl={gmailAuthUrlQuery.integrationGetGoogleAuthUrl || ''}
    />
  );
};

export default withProps<Props>(
  compose(
    graphql<Props, GetGoogleAuthUrlQueryResponse>(
      gql`
        query integrationGetGoogleAuthUrl {
          integrationGetGoogleAuthUrl(service: "gmail")
        }
      `,
      { name: 'gmailAuthUrlQuery' }
    ),
    graphql<Props, messengerAppsAddGoogleMeetMutationResponse>(
      gql`
        mutation messengerAppsAddGoogleMeet(
          $name: String!
          $accountId: String!
        ) {
          messengerAppsAddGoogleMeet(name: $name, accountId: $accountId) {
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
  )(withRouter<FinalProps>(Meet))
);
