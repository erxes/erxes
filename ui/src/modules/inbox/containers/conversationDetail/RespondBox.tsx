import { AppConsumer } from 'appContext';
import gql from 'graphql-tag';
import { fromJS } from 'immutable';
import * as compose from 'lodash.flowright';
import debounce from 'lodash/debounce';
import { IAttachmentPreview } from 'modules/common/types';
import RespondBox from 'modules/inbox/components/conversationDetail/workarea/RespondBox';
import { queries } from 'modules/inbox/graphql';
import React from 'react';
import { graphql } from 'react-apollo';
import { IUser } from '../../../auth/types';
import { withProps } from '../../../common/utils';
import { ResponseTemplatesQueryResponse } from '../../../settings/responseTemplates/types';
import { UsersQueryResponse } from '../../../settings/team/types';
import { AddMessageMutationVariables, IConversation } from '../../types';

type Props = {
  conversation: IConversation;
  showInternal: boolean;
  setAttachmentPreview: (attachmentPreview: IAttachmentPreview) => void;
  addMessage: (doc: {
    variables: AddMessageMutationVariables;
    optimisticResponse: any;
    kind: string;
    callback: (error: Error) => void;
  }) => void;
  refetchMessages: () => void;
  refetchDetail: () => void;
};

type FinalProps = {
  responseTemplatesQuery: ResponseTemplatesQueryResponse;
  usersQuery: UsersQueryResponse;
  search: (value: string) => void;
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
    currentUser,
    search
  } = props;

  const onSearchChange = (searchValue: string) => {
    if (searchValue) {
      debounce(() => search(searchValue), 500)();
    }
  };

  const sendMessage = (
    variables: AddMessageMutationVariables,
    callback: (error: Error) => void
  ) => {
    const {
      conversationId,
      content,
      attachments,
      internal,
      contentType
    } = variables;

    let optimisticResponse;

    if (conversation.integration.kind === 'messenger') {
      optimisticResponse = {
        __typename: 'Mutation',
        conversationMessageAdd: {
          __typename: 'ConversationMessage',
          _id: Math.round(Math.random() * -1000000),
          content,
          contentType,
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
          botData: null,
          mailData: null,
          user: null,
          customer: null,
          videoCallData: null
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
    onSearchChange,
    sendMessage,
    responseTemplates: responseTemplatesQuery.responseTemplates || [],
    teamMembers: fromJS(teamMembers.filter(member => member.name))
  };

  return <RespondBox {...updatedProps} />;
};

const withQuery = () =>
  withProps<Props & { currentUser: IUser } & { searchValue: string }>(
    compose(
      graphql<Props & { searchValue: string }, UsersQueryResponse>(
        gql(queries.userList),
        {
          name: 'usersQuery',
          options: ({ searchValue }) => ({
            variables: {
              searchValue
            }
          })
        }
      ),
      graphql<Props, ResponseTemplatesQueryResponse>(
        gql(queries.responseTemplateList),
        {
          name: 'responseTemplatesQuery',
          options: () => {
            return {
              variables: {
                perPage: 200
              }
            };
          }
        }
      )
    )(RespondBoxContainer)
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
