import { connect } from 'react-redux';
import { Chat } from '../actions';
import Retry from '../components/Retry.jsx';


const mapDispatchToProps = dispatch => ({
  sendMessage(message) {
    if (!message.trim()) {
      return;
    }

    dispatch(Chat.sendMessage(message));
  },
});

export default connect(null, mapDispatchToProps)(Retry);
