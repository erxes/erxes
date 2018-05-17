import { connect } from 'react-redux';
import { connection } from '../connection';
import { TopBar } from '../components';
import { endConversation } from '../actions/messenger';

const mapStateToProps = () => ({
  color: connection.data.uiOptions && connection.data.uiOptions.color,
  isChat: Boolean(!connection.setting.email),
});

const mapDispatchToProps = dispatch => ({
  endConversation() {
    dispatch(endConversation());
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(TopBar);
