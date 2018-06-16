import React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { fromJS } from 'immutable';
import { RespondBox } from 'modules/inbox/components/conversationDetail';
import { queries } from 'modules/inbox/graphql';

const RespondBoxContainer = (props, context) => {
  const {
    conversation,
    usersQuery,
    addMessage,
    responseTemplatesQuery
  } = props;

  const { currentUser } = context;

  const sendMessage = (variables, callback) => {
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
          isCustomerRead: false,
          formWidgetData: null,
          twitterData: null,
          facebookData: null,
          user: {
            _id: '',
            username: '',
            details: {
              avatar: '',
              fullName: '',
              position: ''
            }
          },
          customer: {
            _id: '',
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            isUser: '',
            companies: {
              _id: '',
              name: '',
              website: ''
            },
            getMessengerCustomData: null,
            customFieldsData: null,
            messengerData: null,
            twitterData: null,
            facebookData: null,
            tagIds: [],
            getTags: {
              _id: '',
              name: '',
              colorCode: ''
            }
          }
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

  const teamMembers = [];

  for (let user of usersQuery.users || []) {
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

RespondBoxContainer.contextTypes = {
  currentUser: PropTypes.object
};

RespondBoxContainer.propTypes = {
  conversation: PropTypes.object,
  object: PropTypes.object,
  responseTemplatesQuery: PropTypes.object,
  usersQuery: PropTypes.object,
  addMessage: PropTypes.func
};

export default compose(
  graphql(gql(queries.userList), { name: 'usersQuery' }),
  graphql(gql(queries.responseTemplateList), {
    name: 'responseTemplatesQuery'
  })
)(RespondBoxContainer);
