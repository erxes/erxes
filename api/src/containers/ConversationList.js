import { connect } from 'react-redux';
import { changeConversation, toMessageForm, readMessages } from '../actions/conversations';
import { ConversationList } from '../components';


const mapStateToProps = state => ({
  conversations: state.chat.conversations,
  notifs: state.notifs,
});

const mapDisptachToProps = dispatch => ({
  goToConversation(conversationId) {
    // change current conversation
    dispatch(changeConversation(conversationId));

    // show message form
    dispatch(toMessageForm(true));

    // mark as read
    dispatch(readMessages(conversationId));
  },
});

export default connect(mapStateToProps, mapDisptachToProps)(ConversationList) ;
