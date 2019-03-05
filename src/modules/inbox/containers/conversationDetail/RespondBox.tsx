import { AppConsumer } from 'appContext';
import gql from 'graphql-tag';
import { fromJS } from 'immutable';
import { IAttachmentPreview } from 'modules/common/types';
import { RespondBox } from 'modules/inbox/components/conversationDetail';
import { queries } from 'modules/inbox/graphql';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { IUser } from '../../../auth/types';
import { withProps } from '../../../common/utils';
import { ResponseTemplatesQueryResponse } from '../../../settings/responseTemplates/types';
import { UsersQueryResponse } from '../../../settings/team/types';
import { AddMessageMutationVariables, IConversation } from '../../types';

type Props = {
  conversation: IConversation;
  showInternal: boolean;
  setAttachmentPreview: (attachmentPreview: IAttachmentPreview) => void;
  addMessage: (
    doc: {
      variables: AddMessageMutationVariables;
      optimisticResponse: any;
      kind: string;
      callback: (error: Error) => void;
    }
  ) => void;
};

type FinalProps = {
  responseTemplatesQuery: ResponseTemplatesQueryResponse;
  usersQuery: UsersQueryResponse;
} & Props & { currentUser: IUser };

interface ITeamMembers {
  _id: string;
  name: string;
  title?: string;
  avatar?: string;
}

const RespondBoxContainer = (props: FinalProps) => {
  const {
    conversation,
    usersQuery,
    addMessage,
    responseTemplatesQuery,
    currentUser
  } = props;

  const sendMessage = (
    variables: AddMessageMutationVariables,
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
          fromBot: false,
          formWidgetData: null,
          twitterData: null,
          facebookData: null,
          gmailData: null,
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
      title: user.details && user.details.position,
      avatar: user.details && user.details.avatar
    });
  }

  const updatedProps = {
    ...props,
    sendMessage,
    responseTemplates: responseTemplatesQuery.responseTemplates || [],
    teamMembers: fromJS(teamMembers.filter(member => member.name))
  };

  return <RespondBox {...updatedProps} />;
};
const WithQuery = withProps<Props & { currentUser: IUser }>(
  compose(
    graphql<Props, UsersQueryResponse>(gql(queries.userList), {
      name: 'usersQuery'
    }),
    graphql<Props, ResponseTemplatesQueryResponse>(
      gql(queries.responseTemplateList),
      {
        name: 'responseTemplatesQuery'
      }
    )
  )(RespondBoxContainer)
);

// TODO: Context currentUser must be required not optional

const WithConsumer = (props: Props) => {
  return (
    <AppConsumer>
      {({ currentUser }) => (
        <WithQuery {...props} currentUser={currentUser || ({} as IUser)} />
      )}
    </AppConsumer>
  );
};

export default WithConsumer;
