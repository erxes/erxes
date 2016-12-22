import React from 'react';
import gql from 'graphql-tag';
import { connect } from 'react-redux';
import { graphql } from 'react-apollo';
import Subscriber from './Subscriber';
import { changeRoute, changeConversation } from '../actions/messenger';
import { Conversation as DumbConversation } from '../components';


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


class Conversation extends Subscriber {
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
      updateQuery: (_previousResult, { subscriptionData }) => {
        const previousResult = _previousResult;

        // get previous messages list
        const messages = previousResult.messages || [];

        // add new one
        messages.push(subscriptionData.data.messageInserted);

        previousResult.messages = messages;

        return previousResult;
      },
    };
  }

  render() {
    const props = this.props;

    if (props.data.loading) {
      return null;
    }

    const extendedProps = {
      ...props,
      messages: props.data.messages,
    };

    return <DumbConversation { ...extendedProps } />;
  }
}


const mapStateToProps = state => {
  const isNewConversation = !state.activeConversation;

  return { conversationId: state.activeConversation, isNewConversation };
};

const mapDisptachToProps = dispatch => ({
  goToConversationList(e) {
    e.preventDefault();

    // reset current conversation
    dispatch(changeConversation(''));

    dispatch(changeRoute('conversationList'));
  },
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

const WithData = withData(Conversation);

export default connect(mapStateToProps, mapDisptachToProps)(WithData);
