import { connect } from 'react-redux';
import MessagesList from '../components/MessagesList.jsx';


const mapStateToProps = state => ({
  messages: state.chat.messages,
});

export default connect(mapStateToProps)(MessagesList);
