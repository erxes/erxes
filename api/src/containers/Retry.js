import { connect } from 'react-redux';
import { sendMessage } from '../actions/messages';
import { Retry } from '../components';


const mapDispatchToProps = dispatch => ({
  sendMessage(message) {
    if (!message.trim()) {
      return;
    }

    dispatch(sendMessage(message));
  },
});

export default connect(null, mapDispatchToProps)(Retry);
