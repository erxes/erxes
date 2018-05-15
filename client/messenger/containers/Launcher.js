import { connect } from 'react-redux';
import { toggle, openLastConversation } from '../actions/messenger';
import { Launcher } from '../components';

const mapStateToProps = state => ({
  isMessengerVisible: state.isVisible,
  isBrowserInfoSaved: state.isBrowserInfoSaved,
});

const mapDisptachToProps = dispatch => ({
  onClick(isVisible) {
    dispatch(openLastConversation());
    dispatch(toggle(isVisible));
  },
});

export default connect(mapStateToProps, mapDisptachToProps)(Launcher);
