import { connect } from 'react-redux';
import { Chat } from '../actions';
import { ConversationList } from '../components';


const mapStateToProps = state => ({
  conversations: state.chat.conversations,
  notifs: state.notifs,
});

const mapDisptachToProps = dispatch => ({
  goToConversation(conversationId) {
    // change current conversation
    dispatch(Chat.changeConversation(conversationId));

    // show message form
    dispatch(Chat.toMessageForm(true));

    // mark as read
    dispatch(Chat.readMessages(conversationId));
  },
});

export default connect(mapStateToProps, mapDisptachToProps)(ConversationList) ;
