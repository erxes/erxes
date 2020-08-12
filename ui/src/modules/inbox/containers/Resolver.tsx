import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { Alert, withProps } from 'modules/common/utils';
import { CONVERSATION_STATUSES } from 'modules/inbox/constants';
import React from 'react';
import { graphql } from 'react-apollo';
import Resolver from '../components/Resolver';
import { mutations } from '../graphql';
import {
  ChangeStatusMutationResponse,
  ChangeStatusMutationVariables,
  IConversation
} from '../types';
import { refetchSidebarConversationsOptions } from '../utils';
import { InboxManagementActionConsumer } from './Inbox';

type Props = {
  conversations: IConversation[];
  emptyBulk?: () => void;
};

type FinalProps = Props & ChangeStatusMutationResponse;

const ResolverContainer = (props: FinalProps) => {
  const { changeStatusMutation, emptyBulk } = props;

  // change conversation status
  const changeStatus = notifyHandler => (conversationIds: string[], status) => {
    changeStatusMutation({ variables: { _ids: conversationIds, status } })
      .then(() => {
        if (notifyHandler) {
          notifyHandler();
        }

        if (status === CONVERSATION_STATUSES.CLOSED) {
          Alert.success('The conversation has been resolved!');

          // clear saved messages from storage
          conversationIds.forEach(c => {
            localStorage.removeItem(c);
          });
        } else {
          Alert.info(
            'The conversation has been reopened and restored to Inbox'
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
    ...props
  };

  return (
    <InboxManagementActionConsumer>
      {({ notifyConsumersOfManagementAction }) => (
        <Resolver
          {...updatedProps}
          changeStatus={changeStatus(notifyConsumersOfManagementAction)}
        />
      )}
    </InboxManagementActionConsumer>
  );
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
