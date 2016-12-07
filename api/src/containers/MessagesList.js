import { connect } from 'react-redux';
import { MessagesList } from '../components';


const mapStateToProps = state => ({
  messages: state.messenger.messages,
});

export default connect(mapStateToProps)(MessagesList);
