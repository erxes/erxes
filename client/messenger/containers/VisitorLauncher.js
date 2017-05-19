import { connect } from 'react-redux';
import { toggle } from '../actions/messenger';
import { Launcher } from '../components';

const mapStateToProps = state => ({
  isMessengerVisible: state.isVisible,
  notificationCount: 0,
});

const mapDisptachToProps = dispatch => ({
  onClick(isVisible) {
    dispatch(toggle(isVisible));
  },
});

export default connect(mapStateToProps, mapDisptachToProps)(Launcher);
