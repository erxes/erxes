import { connect } from 'react-redux';
import { readMessages, sendMessage, sendFile } from '../actions/messages';
import { MessageSender } from '../components';


const mapStateToProps = state => ({
  isAttachingFile: state.isAttachingFile,
  conversationId: state.activeConversation,
});

const mapDispatchToProps = dispatch => ({
  sendMessage(message) {
    if (!message.trim()) {
      return;
    }

    dispatch(sendMessage(message));
  },

  readMessages(conversationId) {
    if (conversationId) {
      dispatch(readMessages(conversationId));
    }
  },

  sendFile(file) {
    dispatch(sendFile(file));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(MessageSender);
