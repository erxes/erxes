import { connect } from 'react-redux';
import { Chat } from '../actions';
import { MessageSender } from '../components';


const mapStateToProps = state => ({
  isAttachingFile: state.chat.isAttachingFile,
});

const mapDispatchToProps = dispatch => ({
  sendMessage(message) {
    if (!message.trim()) {
      return;
    }

    dispatch(Chat.sendMessage(message));
  },
  sendFile(file) {
    dispatch(Chat.sendFile(file));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(MessageSender);
