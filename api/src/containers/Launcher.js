import { connect } from 'react-redux';
import { hide, show } from '../actions/conversations';
import { Launcher } from '../components';


const mapStateToProps = state => ({
  notifsCount: Object.keys(state.notifs).reduce((sum, i) => sum + state.notifs[i], 0),
  isChatVisible: state.chat.isVisible,
});

/**
 * Using mergeProps function to access states inside dispatch functions
 */
const mergeProps = (stateProps, { dispatch }, ownProps) => ({
  ...stateProps,
  ...ownProps,
  onLauncherClick() {
    if (stateProps.isChatVisible) {
      return dispatch(hide());
    }

    return dispatch(show());
  },
});

export default connect(mapStateToProps, null, mergeProps)(Launcher);
