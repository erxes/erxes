import gql from 'graphql-tag';
import Alert from 'modules/common/utils/Alert';
import React from 'react';
import { compose, graphql } from 'react-apollo';
import { withProps } from '../../common/utils';
import { UsersQueryResponse } from '../../settings/team/types';
import AssignBox from '../components/assignBox/AssignBox';
import { mutations, queries } from '../graphql';
import {
  AssignMutationResponse,
  AssignMutationVariables,
  IConversation,
  UnAssignMutationResponse,
  UnAssignMutationVariables
} from '../types';
import { refetchSidebarConversationsOptions } from '../utils';

type Props = {
  targets: IConversation[];
  event: string;
  afterSave: () => void;
};

type FinalProps = {
  usersQuery: UsersQueryResponse;
} & Props &
  AssignMutationResponse &
  UnAssignMutationResponse;

const AssignBoxContainer = (props: FinalProps) => {
  const { usersQuery, assignMutation, conversationsUnassign } = props;

  if (usersQuery.loading) {
    return null;
  }

  const assign = (
    {
      conversationIds,
      assignedUserId
    }: { conversationIds?: string[]; assignedUserId: string },
    callback: (e) => void
  ) => {
    assignMutation({
      variables: {
        conversationIds,
        assignedUserId
      }
    })
      .then(() => {
        Alert.success('The conversation Assignee has been renewed.');
      })
      .catch(e => {
        callback(e);
        Alert.error(e.message);
      });
  };

  const clear = (conversationIds: string[]) => {
    conversationsUnassign({
      variables: {
        _ids: conversationIds
      }
    })
      .then(() => {
        Alert.success('The conversation Assignee removed');
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  const verifiedUsers = usersQuery.users.filter(user => user.username) || [];

  const updatedProps = {
    ...props,
    assignees: verifiedUsers,
    assign,
    clear
  };

  return <AssignBox {...updatedProps} />;
};

export default withProps<Props>(
  compose(
    graphql<Props, UsersQueryResponse>(gql(queries.userList), {
      name: 'usersQuery'
    }),
    graphql<Props, AssignMutationResponse, AssignMutationVariables>(
      gql(mutations.conversationsAssign),
      {
        name: 'assignMutation',
        options: () => refetchSidebarConversationsOptions()
      }
    ),
    graphql<Props, UnAssignMutationResponse, UnAssignMutationVariables>(
      gql(mutations.conversationsUnassign),
      {
        name: 'conversationsUnassign',
        options: () => refetchSidebarConversationsOptions()
      }
    )
  )(AssignBoxContainer)
);
