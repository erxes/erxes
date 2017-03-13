import { connect } from 'react-redux';
import { toggle } from '../actions';
import { Launcher } from '../components';

const mapStateToProps = state => ({
  isFormVisible: state.isVisible,
});

const mapDisptachToProps = dispatch => ({
  onClick(isVisible) {
    dispatch(toggle(isVisible));
  },
});

export default connect(mapStateToProps, mapDisptachToProps)(Launcher);
