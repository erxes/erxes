import { connect } from 'react-redux';
import { toggle } from '../actions/messenger';
import { Launcher } from '../components';


const mapStateToProps = state => ({
  notificationCount: Object.keys(state.notifications)
    .reduce((sum, i) => sum + state.notifications[i], 0),
  isMessengerVisible: state.messenger.isVisible,
});

const mapDisptachToProps = dispatch => ({
  onClick() {
    return dispatch(toggle());
  },
});

export default connect(mapStateToProps, mapDisptachToProps)(Launcher);
