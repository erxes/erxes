import { connect } from 'react-redux';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { readMessages } from '../actions/messages';
import { changeRoute, changeConversation } from '../actions/messenger';
import { ConversationList } from '../components';

// The `graphql` wrapper executes a GraphQL query and makes the results
// available on the `data` prop of the wrapped component (ConversationList here)
const withQueryData = graphql(gql`
  query allConversations {
    conversations {
      _id
      content
    }
  }
`)(ConversationList);


const mapStateToProps = state => ({
  conversations: state.conversations,
  notifications: state.notifications,
});

const mapDisptachToProps = dispatch => ({
  createConversation(e) {
    e.preventDefault();
    dispatch(changeRoute('conversation'));
  },

  goToConversation(conversationId) {
    // change current conversation
    dispatch(changeConversation(conversationId));

    // change route
    dispatch(changeRoute('conversation'));

    // mark as read
    dispatch(readMessages(conversationId));
  },
});

export default connect(mapStateToProps, mapDisptachToProps)(withQueryData);
