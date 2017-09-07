import { Meteor } from 'meteor/meteor';
import React, { PropTypes } from 'react';
import { compose, gql, graphql } from 'react-apollo';
import { ReactiveVar } from 'meteor/reactive-var';
import { Details } from '../components';

const attachmentPreview = new ReactiveVar({});

const DetailsContainer = props => {
  const { channelId, queryParams, conversationDetailQuery } = props;

  if (conversationDetailQuery.loading) {
    return null;
  }

  const conversation = conversationDetailQuery.conversationDetail;
  const messages = conversation.messages;

  // =============== actions
  const changeStatus = (conversationId, status, callback) => {
    Meteor.call(
      'conversations.changeStatus',
      { conversationIds: [conversationId], status },
      callback,
    );
  };

  const setAttachmentPreview = previewObject => {
    attachmentPreview.set(previewObject);
  };

  // mark as read
  const readUserIds = conversation.readUserIds || [];

  if (!readUserIds.includes(Meteor.userId())) {
    Meteor.call('conversations.markAsRead', { conversationId: conversation._id });
  }

  const updatedProps = {
    ...props,
    conversation,
    messages,
    channelId,
    changeStatus,
    setAttachmentPreview,
    queryParams,
    attachmentPreview: attachmentPreview.get(),
  };

  return <Details {...updatedProps} />;
};

DetailsContainer.propTypes = {
  channelId: PropTypes.string,
  queryParams: PropTypes.object,
  conversationDetailQuery: PropTypes.object,
};

export default compose(
  graphql(
    gql`
      query conversationDetail($_id: String!) {
        conversationDetail(_id: $_id) {
          _id
          assignedUser {
            _id
            details
          }
          integration {
            _id
            brandId,
            brand {
              _id
              name
            }
            channels {
              _id
              name
            }
          }
          customer {
            _id
            name
          }
          messages {
            _id
            content
            user {
              _id
              username
              details
            }
            customer {
              _id
              name
            }
          }
          participatedUsers {
            _id
            details
          }
          tags {
            _id
            name
            color
          }
        }
      }
    `,
    {
      name: 'conversationDetailQuery',
      options: ({ id }) => ({
        fetchPolicy: 'network-only',
        variables: {
          _id: id,
        },
      }),
    },
  ),
)(DetailsContainer);
