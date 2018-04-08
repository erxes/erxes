import { connect } from 'react-redux';
import { toggleShoutbox } from '../actions';
import { ShoutboxLauncher } from '../components';

const mapStateToProps = state => ({
  isFormVisible: state.isFormVisible,
});

const mapDisptachToProps = dispatch => ({
  onClick(isVisible) {
    dispatch(toggleShoutbox(isVisible));
  },
});

export default connect(mapStateToProps, mapDisptachToProps)(ShoutboxLauncher);
