import { connect } from 'react-redux';
import { Chat } from '../actions';
import HelpButton from '../components/HelpButton.jsx';


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
      return dispatch(Chat.hide());
    }

    return dispatch(Chat.show());
  },
});

export default connect(mapStateToProps, null, mergeProps)(HelpButton);
