import { connect } from 'react-redux';
import { Category } from '../components';
import { switchToCategoryDisplay } from '../actions';

const mapStateToProps = (state, ownProps) => ({
  ...ownProps,
});

const mapDisptachToProps = dispatch => ({
  onSwitchToCategoryDisplay(category) {
    dispatch(switchToCategoryDisplay(category));
  },
});

export default connect(mapStateToProps, mapDisptachToProps)(Category);
