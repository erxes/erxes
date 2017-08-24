import { connect } from 'react-redux';
import { Launcher } from '../components';
import { toggleLauncher } from '../actions';

const mapStateToProps = (state, ownProps) => ({
  ...ownProps,
  isLauncherVisible: state.isVisible,
});

const mapDispatchToProps = dispatch => ({
  onClick(isToggled) {
    dispatch(toggleLauncher(isToggled));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(Launcher);
