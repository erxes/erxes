import { AppConsumer } from 'appContext';
import gql from 'graphql-tag';
import { fromJS } from 'immutable';
import { RespondBox } from 'modules/inbox/components/conversationDetail';
import { queries } from 'modules/inbox/graphql';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { IUser } from '../../../auth/types';
import { IConversation } from '../../types';
import { IAddMessage } from './WorkArea';

type Props = {
  conversation: IConversation;
  responseTemplatesQuery: any;
  usersQuery: any;
  addMessage: (
    doc: {
      variables: IAddMessage;
      optimisticResponse: any;
      kind: string;
      callback: (error: Error) => void;
    }
  ) => void;
  currentUser: IUser;
};

interface ITeamMembers {
  _id: string;
  name: string;
  title: string;
  avatar: string;
}

const RespondBoxContainer = (props: Props) => {
  const {
    conversation,
    usersQuery,
    addMessage,
    responseTemplatesQuery,
    currentUser
  } = props;

  const sendMessage = (
    variables: IAddMessage,
    callback: (error: Error) => void
  ) => {
    const { conversationId, content, attachments, internal } = variables;

    let optimisticResponse;

    if (conversation.integration.kind === 'messenger') {
      optimisticResponse = {
        __typename: 'Mutation',
        conversationMessageAdd: {
          __typename: 'ConversationMessage',
          _id: Math.round(Math.random() * -1000000),
          content,
          attachments,
          internal,
          mentionedUserIds: [],
          conversationId,
          customerId: Math.random(),
          userId: currentUser._id,
          createdAt: new Date(),
          messengerAppData: null,
          isCustomerRead: false,
          formWidgetData: null,
          twitterData: null,
          facebookData: null,
          user: null,
          customer: null
        }
      };
    }

    addMessage({
      variables,
      optimisticResponse,
      kind: conversation.integration.kind,
      callback
    });
  };

  const teamMembers: ITeamMembers[] = [];

  for (const user of usersQuery.users || []) {
    teamMembers.push({
      _id: user._id,
      name: user.username,
      title: user.details.position,
      avatar: user.details.avatar
    });
  }

  const updatedProps = {
    ...props,
    sendMessage,
    responseTemplates: responseTemplatesQuery.responseTemplates || [],
    teamMembers: fromJS(teamMembers)
  };

  return <RespondBox {...updatedProps} />;
};

const WithQuery = compose(
  graphql(gql(queries.userList), { name: 'usersQuery' }),
  graphql(gql(queries.responseTemplateList), {
    name: 'responseTemplatesQuery'
  })
)(RespondBoxContainer);

const WithConsumer = props => {
  return (
    <AppConsumer>
      {({ currentUser }) => <WithQuery {...props} currentUser={currentUser} />}
    </AppConsumer>
  );
};

export default WithConsumer;
