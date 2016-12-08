import { connect } from 'react-redux';
import { MessagesList } from '../components';


const mapStateToProps = state => ({
  messages: state.messages,
});

export default connect(mapStateToProps)(MessagesList);
