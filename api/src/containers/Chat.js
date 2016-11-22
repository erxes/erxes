import { connect } from 'react-redux';
import { Chat as actions } from '../actions';
import { Chat } from '../components';


const mapStateToProps = state => ({
  conversations: state.chat.conversations,
  currentPanel: state.chat.showMessageForm || state.chat.conversations.length === 0
    ? 'conversation'
    : 'conversationList',
});

const mapDispatchToProps = dispatch => ({
  goToConversationList(e) {
    e.preventDefault();

    // reset current conversation
    dispatch(actions.changeConversation(''));

    // hide message form
    dispatch(actions.toMessageForm(false));
  },
  goToConversation(e) {
    e.preventDefault();

    // show message form
    dispatch(actions.toMessageForm(true));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(Chat);
