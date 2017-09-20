import { Meteor } from 'meteor/meteor';
import React, { PropTypes, Component } from 'react';
import { compose, gql, graphql } from 'react-apollo';
import { ReactiveVar } from 'meteor/reactive-var';
import { Details } from '../components';
import { Loading } from '/imports/react-ui/common';
import { queries, subscriptions } from '../graphql';

const attachmentPreview = new ReactiveVar({});

class DetailsContainer extends Component {
  componentWillMount() {
    const { id, conversationDetailQuery } = this.props;

    // lister for new message insert
    conversationDetailQuery.subscribeToMore({
      document: gql(subscriptions.conversationUpdated),
      variables: { conversationId: id },
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) {
          return prev;
        }

        const { type, message } = subscriptionData.data.conversationUpdated;

        // if some changes except newMessage occur, refetch query
        if (type !== 'newMessage') {
          this.props.conversationDetailQuery.refetch();
          return prev;
        }

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
  }

  render() {
    const { channelId, queryParams, conversationDetailQuery } = this.props;

    if (conversationDetailQuery.loading) {
      return <Loading title="Conversation" spin sidebarSize="wide" hasRightSidebar />;
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
