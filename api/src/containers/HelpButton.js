import { connect } from 'react-redux';
import { Chat } from '../actions';

import HelpButton from '../components/HelpButton';

const mapStateToProps = (state) => {
  // calculate total unread messages count
  let totalNotifsCount = 0;

  for (const key of Object.keys(state.notifs)) {
    totalNotifsCount += state.notifs[key];
  }

  return {
    notifsCount: totalNotifsCount,
  };
};

const mapDispatchToProps = (dispatch, ownProps) => ({
  onLauncherClick() {
    if (ownProps.isVisible) {
      return dispatch(Chat.hide());
    }

    return dispatch(Chat.show());
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(HelpButton);
