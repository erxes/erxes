import { Meteor } from 'meteor/meteor';
import React, { PropTypes, Component } from 'react';
import { compose, gql, graphql } from 'react-apollo';
import { ReactiveVar } from 'meteor/reactive-var';
import { Details } from '../components';
import { ConversationDetail as ConversationDetailQuery, MessageSubscription } from '../graphql';

const attachmentPreview = new ReactiveVar({});

class DetailsContainer extends Component {
  componentWillMount() {
    const { id, conversationDetailQuery } = this.props;

    // lister for new message insert
    conversationDetailQuery.subscribeToMore({
      document: gql(MessageSubscription),
      variables: { conversationId: id },
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) {
          return prev;
        }

        // newly created message
        const newMessage = subscriptionData.data.conversationMessageAdded;

        const conversationDetail = prev.conversationDetail;
        const messages = conversationDetail.messages;

        // add new message to messages list
        const next = Object.assign({}, prev, {
          conversationDetail: Object.assign({
            ...conversationDetail,
            messages: [...messages, newMessage],
          }),
        });

        return next;
      },
    });
  }

  render() {
    const { channelId, queryParams, conversationDetailQuery } = this.props;

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
      ...this.props,
      conversation,
      messages,
      channelId,
      changeStatus,
      setAttachmentPreview,
      queryParams,
      attachmentPreview: attachmentPreview.get(),
    };

    return <Details {...updatedProps} />;
  }
}

DetailsContainer.propTypes = {
  id: PropTypes.string,
  channelId: PropTypes.string,
  queryParams: PropTypes.object,
  conversationDetailQuery: PropTypes.object,
  subscribeToNewMessages: PropTypes.func,
  data: PropTypes.object,
};

export default compose(
  graphql(gql(ConversationDetailQuery), {
    name: 'conversationDetailQuery',
    options: ({ id }) => ({
      variables: {
        _id: id,
      },
    }),
  }),
)(DetailsContainer);
