import { connect } from 'react-redux';
import { show, hide } from '../actions/messenger';
import { Launcher } from '../components';


const mapStateToProps = state => ({
  notificationCount: Object.keys(state.notifications)
    .reduce((sum, i) => sum + state.notifications[i], 0),
  isMessengerVisible: state.messenger.isVisible,
});

/**
 * Using mergeProps function to access states inside dispatch functions
 */
const mergeProps = (stateProps, { dispatch }, ownProps) => ({
  ...stateProps,
  ...ownProps,
  onClick() {
    if (stateProps.isMessengerVisible) {
      return dispatch(hide());
    }

    return dispatch(show());
  },
});

export default connect(mapStateToProps, null, mergeProps)(Launcher);
