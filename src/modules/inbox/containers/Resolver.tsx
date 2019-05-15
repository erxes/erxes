import gql from 'graphql-tag';
import { Alert, withProps } from 'modules/common/utils';
import { CONVERSATION_STATUSES } from 'modules/inbox/constants';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { Resolver } from '../components';
import { mutations } from '../graphql';
import {
  ChangeStatusMutationResponse,
  ChangeStatusMutationVariables,
  IConversation
} from '../types';
import { refetchSidebarConversationsOptions } from '../utils';

type Props = {
  conversations: IConversation[];
  emptyBulk?: () => void;
};

type FinalProps = Props & ChangeStatusMutationResponse;

const ResolverContainer = (props: FinalProps) => {
  const { changeStatusMutation, emptyBulk } = props;

  // change conversation status
  const changeStatus = (conversationIds, status) => {
    changeStatusMutation({ variables: { _ids: conversationIds, status } })
      .then(() => {
        if (status === CONVERSATION_STATUSES.CLOSED) {
          Alert.success('The conversation has been resolved!');

          // clear saved messages from storage
          conversationIds.map(c => {
            localStorage.removeItem(c);
          });
        } else {
          Alert.info(
            'The conversation has been reopened and restored to Inbox.'
          );
        }

        if (emptyBulk) {
          emptyBulk();
        }
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  const updatedProps = {
    ...props,
    changeStatus
  };

  return <Resolver {...updatedProps} />;
};

export default withProps<Props>(
  compose(
    graphql<Props, ChangeStatusMutationResponse, ChangeStatusMutationVariables>(
      gql(mutations.conversationsChangeStatus),
      {
        name: 'changeStatusMutation',
        options: () => refetchSidebarConversationsOptions()
      }
    )
  )(ResolverContainer)
);
