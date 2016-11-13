import { connect } from 'react-redux';
import { Chat } from '../actions';

import HelpButton from '../components/HelpButton';

const mapStateToProps = (state, ownProps) => {
  const customers = state.customers || [];
  const customer = customers.find(c => c.email === ownProps.email) || {};

  // calculate total unread comments count
  let totalNotifsCount = 0;

  for (const key of Object.keys(state.notifs)) {
    totalNotifsCount += state.notifs[key];
  }

  return {
    customer,
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
