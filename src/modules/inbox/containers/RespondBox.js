import React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { fromJS } from 'immutable';
import { queries } from '../graphql';
import { RespondBox } from '../components';

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
          engageData: null,
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
