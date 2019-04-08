import gql from 'graphql-tag';
import { IRouterProps } from 'modules/common/types';
import { Alert, withProps } from 'modules/common/utils';
import { mutations, queries } from 'modules/settings/integrations/graphql';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { withRouter } from 'react-router';
import { Meet as DumbMeet } from '../../components/google';
import {
  MessengerAppsAddGoogleMeetMutationResponse,
  MessengerAppsAddGoogleMeetMutationVariables
} from '../../types';

type Props = {
  type: string;
  history: any;
  closeModal: () => void;
};

type FinalProps = MessengerAppsAddGoogleMeetMutationResponse &
  Props &
  IRouterProps;

const Meet = (props: FinalProps) => {
  const { history, saveMutation, closeModal } = props;

  const save = (
    doc: MessengerAppsAddGoogleMeetMutationVariables,
    callback: () => void
  ) => {
    saveMutation({ variables: doc })
      .then(() => {
        callback();
        Alert.success('You successfully added an integration');
        history.push('/settings/integrations');
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  return <DumbMeet save={save} closeModal={closeModal} />;
};

export default withProps<Props>(
  compose(
    graphql<Props, MessengerAppsAddGoogleMeetMutationResponse>(
      gql(mutations.messengerAppsAddGoogleMeet),
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
