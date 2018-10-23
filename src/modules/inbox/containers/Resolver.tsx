import gql from 'graphql-tag';
import { Alert } from 'modules/common/utils';
import { CONVERSATION_STATUSES } from 'modules/inbox/constants';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { Resolver } from '../components';
import { mutations } from '../graphql';
import { IConversation } from '../types';
import { refetchSidebarConversationsOptions } from '../utils';

type Props = {
  changeStatusMutation: (
    doc: { variables: { _ids: string[]; status: boolean } }
  ) => Promise<any>;

  conversations: IConversation[];
  emptyBulk: () => void;
};

const ResolverContainer = (props: Props) => {
  const { changeStatusMutation, emptyBulk } = props;

  // change conversation status
  const changeStatus = (conversationIds, status) => {
    changeStatusMutation({ variables: { _ids: conversationIds, status } })
      .then(() => {
        if (status === CONVERSATION_STATUSES.CLOSED) {
          Alert.success('The conversation has been resolved!');
        } else {
          Alert.info(
            'The conversation has been reopened and restored to Inbox.'
          );
        }

        emptyBulk();
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

export default compose(
  graphql(gql(mutations.conversationsChangeStatus), {
    name: 'changeStatusMutation',
    options: () => refetchSidebarConversationsOptions()
  })
)(ResolverContainer);
