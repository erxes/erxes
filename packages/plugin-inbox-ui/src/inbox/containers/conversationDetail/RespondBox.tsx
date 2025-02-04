import * as compose from 'lodash.flowright';

import {
  AddMessageMutationVariables,
  EditMessageMutationVariables,
  IConversation,
  IMessage,
} from '@erxes/ui-inbox/src/inbox/types';
import { gql, useLazyQuery } from '@apollo/client';
import { readFile, withProps } from '@erxes/ui/src/utils';

import { AppConsumer } from 'coreui/appContext';
import { IAttachmentPreview } from '@erxes/ui/src/types';
import { IUser } from '@erxes/ui/src/auth/types';
import React from 'react';
import RespondBox from '../../components/conversationDetail/workarea/RespondBox';
import { ResponseTemplatesQueryResponse } from '../../../settings/responseTemplates/types';
import { UsersQueryResponse } from '@erxes/ui/src/auth/types';
import debounce from 'lodash/debounce';
import { graphql } from '@apollo/client/react/hoc';
import { queries } from '@erxes/ui-inbox/src/inbox/graphql';

type Props = {
  conversation: IConversation;
  showInternal: boolean;
  disableInternalState: boolean;
  setAttachmentPreview: (attachmentPreview: IAttachmentPreview) => void;
  addMessage: (doc: {
    variables: AddMessageMutationVariables & EditMessageMutationVariables;
    optimisticResponse: any;
    kind: string;
    callback: (error: Error) => void;
  }) => void;
  refetchMessages: () => void;
  refetchDetail: () => void;
  editMessage?: IMessage;
  onEditMessageId?: (id: string) => void;
};

type FinalProps = {
  responseTemplatesQuery: ResponseTemplatesQueryResponse;
  search: (value: string) => void;
} & Props & { currentUser: IUser };

interface ITeamMembers {
  id: string;
  username: string;
  email?: string;
  fullName?: string;
  title?: string;
  avatar?: string;
}

const RespondBoxContainer = (props: FinalProps) => {
  const {
    conversation,
    addMessage,
    responseTemplatesQuery,
    currentUser,
    search,
  } = props;

  const [fetchMentions] = useLazyQuery(gql(queries.userList));

  const getVariables = (query: string) => {
    return { searchValue: query };
  };

  const extractFunction = (queryResult: UsersQueryResponse) => {
    const mentionUsers: ITeamMembers[] = [];
    for (const user of queryResult.users || []) {
      mentionUsers.push({
        id: user._id,
        username: user.username?.trim(),
        email: user.email?.trim(),
        fullName: user.details && user.details.fullName?.trim(),
        title: user.details && user.details.position,
        avatar:
          user.details &&
          user.details.avatar &&
          readFile(user.details.avatar, 44),
      });
    }
    return mentionUsers;
  };

  const onSearchChange = (searchValue: string) => {
    if (searchValue) {
      debounce(() => search(searchValue), 500)();
    }
  };

  const sendMessage = (
    variables: AddMessageMutationVariables & EditMessageMutationVariables,
    callback: (error: Error) => void,
  ) => {
    const { content, attachments, internal, contentType } = variables;

    // Type guard to check if variables is of type EditMessageMutationVariables
    const isEditMessage = (vars: typeof variables) => {
      return (vars as EditMessageMutationVariables)._id !== undefined;
    };

    const _id = isEditMessage(variables) ? variables._id : undefined;

    let optimisticResponse;

    const generateId = () =>
      Date.now().toString(36) + Math.random().toString(36).slice(2);

    const baseMessageProps = {
      __typename: 'ConversationMessage',
      content,
      contentType,
      attachments,
      internal,
      mentionedUserIds: [],
      userId: currentUser._id,
      customerId: generateId(),
      createdAt: new Date(),
      messengerAppData: null,
      isCustomerRead: false,
      fromBot: false,
      formWidgetData: null,
      botData: null,
      mailData: null,
      user: null,
      customer: null,
      videoCallData: null,
      mid: generateId(),
    };

    const mutation = _id
      ? {
          conversationMessageEdit: {
            ...baseMessageProps,
            _id,
            updatedAt: new Date(),
          },
        }
      : {
          conversationMessageAdd: {
            ...baseMessageProps,
            conversationId: variables.conversationId,
          },
        };

    optimisticResponse = {
      __typename: 'Mutation',
      ...mutation,
    };
    addMessage({
      variables,
      optimisticResponse,
      kind: conversation.integration.kind,
      callback,
    });
  };
  const refetchResponseTemplates = (content) => [
    responseTemplatesQuery.refetch({ searchValue: content }),
  ];
  const updatedProps = {
    ...props,
    onSearchChange,
    sendMessage,
    responseTemplates: responseTemplatesQuery.responseTemplates || [],
    mentionSuggestion: { getVariables, fetchMentions, extractFunction },
    refetchResponseTemplates,
  };

  return <RespondBox {...updatedProps} />;
};

const withQuery = () =>
  withProps<Props & { currentUser: IUser }>(
    compose(
      graphql<Props, ResponseTemplatesQueryResponse>(
        gql(queries.responseTemplateList),
        {
          name: 'responseTemplatesQuery',
          options: () => {
            return {
              variables: {
                perPage: 20,
              },
            };
          },
        },
      ),
    )(RespondBoxContainer),
  );

class Wrapper extends React.Component<
  Props,
  { searchValue: string },
  { WithQuery: React.ReactNode }
> {
  private withQuery;

  constructor(props) {
    super(props);

    this.withQuery = withQuery();

    this.state = { searchValue: '' };
  }

  search = (searchValue: string) => this.setState({ searchValue });

  render() {
    const { searchValue } = this.state;
    const Component = this.withQuery;

    return (
      <AppConsumer>
        {({ currentUser }) => (
          <Component
            {...this.props}
            search={this.search}
            searchValue={searchValue}
            currentUser={currentUser || ({} as IUser)}
          />
        )}
      </AppConsumer>
    );
  }
}

export default Wrapper;
