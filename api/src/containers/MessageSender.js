import { connect } from 'react-redux';
import { sendMessage, sendFile } from '../actions/conversations';
import { MessageSender } from '../components';


const mapStateToProps = state => ({
  isAttachingFile: state.messenger.isAttachingFile,
});

const mapDispatchToProps = dispatch => ({
  sendMessage(message) {
    if (!message.trim()) {
      return;
    }

    dispatch(sendMessage(message));
  },
  sendFile(file) {
    dispatch(sendFile(file));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(MessageSender);
