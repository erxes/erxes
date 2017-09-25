import { Meteor } from 'meteor/meteor';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { compose, gql, graphql } from 'react-apollo';
import { ReactiveVar } from 'meteor/reactive-var';
import { Details } from '../components';
import { Loading } from '/imports/react-ui/common';
import { queries, subscriptions } from '../graphql';

const attachmentPreview = new ReactiveVar({});

class DetailsContainer extends Component {
  componentWillMount() {
    const { id, conversationDetailQuery } = this.props;

    // lister for new message insertion
    conversationDetailQuery.subscribeToMore({
      document: gql(subscriptions.conversationMessageInserted),
      variables: { _id: id },
      updateQuery: (prev, { subscriptionData }) => {
        const message = subscriptionData.data.conversationMessageInserted;
        const conversationDetail = prev.conversationDetail;
        const messages = conversationDetail.messages;

        // add new message to messages list
        const next = Object.assign({}, prev, {
          conversationDetail: Object.assign({
            ...conversationDetail,
            messages: [...messages, message],
          }),
        });

        return next;
      },
    });

    // lister for conversation changes like status, assignee
    conversationDetailQuery.subscribeToMore({
      document: gql(subscriptions.conversationChanged),
      variables: { _id: id },
      updateQuery: () => {
        this.props.conversationDetailQuery.refetch();
      },
    });
  }

  render() {
    const { channelId, queryParams, conversationDetailQuery } = this.props;

    if (conversationDetailQuery.loading) {
      return <Loading title="Conversation" spin hasRightSidebar />;
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
      refetch: conversationDetailQuery.refetch,
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
  graphql(gql(queries.conversationDetail), {
    name: 'conversationDetailQuery',
    options: ({ id }) => ({
      variables: {
        _id: id,
      },
    }),
  }),
)(DetailsContainer);
