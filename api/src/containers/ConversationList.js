import { connect } from 'react-redux';
import { changeConversation, readMessages } from '../actions/conversations';
import { changeRoute } from '../actions/messenger';
import { ConversationList } from '../components';


const mapStateToProps = state => ({
  conversations: state.messenger.conversations,
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

export default connect(mapStateToProps, mapDisptachToProps)(ConversationList) ;
