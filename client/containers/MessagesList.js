import React from 'react';
import gql from 'graphql-tag';
import { connect } from 'react-redux';
import { graphql } from 'react-apollo';
import { MessagesList as DumbMessageList } from '../components';
import Subscriber from './Subscriber';


const messageQuery = `
  _id
  content
  createdAt
  attachments{
    url
    name
    size
    type
  }
`;

class MessagesList extends Subscriber {
  constructor(props) {
    super(props);

    this.subscribeToMoreOptions = {
      document: gql`
        subscription messageInserted {
          messageInserted {
            ${messageQuery}
          }
        }
      `,

      // push new message to messages list when subscription updated
      updateQuery: (previousResult, { subscriptionData }) => {
        previousResult.messages.push(subscriptionData.data.messageInserted);
        return previousResult;
      },
    };
  }

  render() {
    return <DumbMessageList { ...this.props } />;
  }
}

const mapStateToProps = state => ({
  conversationId: state.activeConversation,
});

const withData = graphql(
  gql`
    query ($conversationId: String!) {
      messages(conversationId: $conversationId) {
        ${messageQuery}
      }
    }
  `,
  {
    options: (ownProps) => ({
      variables: { conversationId: ownProps.conversationId },
    }),
  }
);

const ListWithData = withData(MessagesList);

export default connect(mapStateToProps)(ListWithData);
