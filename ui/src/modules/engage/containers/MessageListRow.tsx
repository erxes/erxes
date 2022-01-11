import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { IRouterProps } from 'modules/common/types';
import { Alert, confirm, withProps } from 'modules/common/utils';
import React from 'react';
import { graphql } from 'react-apollo';
import { withRouter } from 'react-router-dom';
import MessageListRow from '../components/MessageListRow';
import { mutations, queries } from '../graphql';
import {
  CopyMutationResponse,
  IEngageMessage,
  MutationVariables,
  RemoveMutationResponse,
  SetLiveManualMutationResponse,
  SetLiveMutationResponse,
  SetPauseMutationResponse
} from '../types';
import { crudMutationsOptions } from '../utils';

type Props = {
  isChecked: boolean;
  toggleBulk: (value: IEngageMessage, isChecked: boolean) => void;
  message: IEngageMessage;
  queryParams: any;
  refetch: () => void;
};

type FinalProps = Props &
  RemoveMutationResponse &
  SetPauseMutationResponse &
  SetLiveMutationResponse &
  SetLiveManualMutationResponse &
  CopyMutationResponse &
  IRouterProps;

const MessageRowContainer = (props: FinalProps) => {
  const {
    copyMutation,
    history,
    message,
    removeMutation,
    setPauseMutation,
    setLiveMutation,
    setLiveManualMutation,
    isChecked,
    toggleBulk,
    refetch
  } = props;

  const doMutation = (mutation, msg: string) =>
    mutation({
      variables: { _id: message._id }
    })
      .then(() => {
        Alert.success(msg);
      })
      .catch(error => {
        Alert.error(error.message);
      });

  const edit = () => {
    history.push(`/campaigns/edit/${message._id}`);
  };

  const show = () => {
    history.push(`/campaigns/show/${message._id}`);
  };

  const remove = () => {
    confirm().then(() => {
      doMutation(removeMutation, `You just deleted a campaign.`)
        .then(() => {
          history.push('/campaigns');
        })
        .catch(e => {
          Alert.error(e.message);
        });
    });
  };

  const setLiveManual = () =>
    doMutation(setLiveManualMutation, 'Yay! Your campaign is now live.');
  const setLive = () =>
    doMutation(setLiveMutation, 'Yay! Your campaign is now live.');
  const setPause = () =>
    doMutation(setPauseMutation, 'Your campaign is paused for now.');
  const copy = () => {
    doMutation(copyMutation, 'Campaign has been copied.').then(() => {
      refetch();
    });
  };

  const updatedProps = {
    ...props,
    edit,
    show,
    remove,
    setLive,
    setLiveManual,
    setPause,
    isChecked,
    toggleBulk,
    copy
  };

  return <MessageListRow {...updatedProps} />;
};

const statusMutationsOptions = ({ queryParams, message }) => {
  return {
    refetchQueries: [
      {
        query: gql(queries.statusCounts),
        variables: {
          kind: queryParams.kind || ''
        }
      },
      {
        query: gql(queries.engageMessageDetail),
        variables: {
          _id: message._id
        }
      }
    ]
  };
};

export default withProps<Props>(
  compose(
    graphql<Props, RemoveMutationResponse, MutationVariables>(
      gql(mutations.messageRemove),
      {
        name: 'removeMutation',
        options: crudMutationsOptions
      }
    ),
    graphql<Props, SetPauseMutationResponse, MutationVariables>(
      gql(mutations.setPause),
      {
        name: 'setPauseMutation',
        options: statusMutationsOptions
      }
    ),
    graphql<Props, SetLiveMutationResponse, MutationVariables>(
      gql(mutations.setLive),
      {
        name: 'setLiveMutation',
        options: statusMutationsOptions
      }
    ),
    graphql<Props, SetLiveManualMutationResponse, MutationVariables>(
      gql(mutations.setLiveManual),
      {
        name: 'setLiveManualMutation',
        options: statusMutationsOptions
      }
    ),
    graphql(gql(mutations.engageMessageCopy), {
      name: 'copyMutation'
    })
  )(withRouter<FinalProps>(MessageRowContainer))
);
