import { connect } from 'react-redux';
import { changeRoute, toggle, changeConversation } from '../actions/messenger';
import { Launcher } from '../components';


const mapStateToProps = state => ({
  notificationCount: Object.keys(state.notifications)
    .reduce((sum, i) => sum + state.notifications[i], 0),
  isMessengerVisible: state.isVisible,
});

const mapDisptachToProps = dispatch => ({
  onClick() {
    dispatch(changeConversation(''));
    dispatch(changeRoute('conversationList'));
    dispatch(toggle());
  },
});

export default connect(mapStateToProps, mapDisptachToProps)(Launcher);
