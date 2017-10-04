import { connect } from 'react-redux';
import { connection } from '../connection';
import { AccquireInformation } from '../components';
import { saveGetNotified } from '../actions/messenger';

const mapStateToProps = () => ({
  color: connection.data.uiOptions && connection.data.uiOptions.color,
});

const mapDisptachToProps = dispatch => ({
  save(params) {
    dispatch(saveGetNotified(params));
  },
});

export default connect(mapStateToProps, mapDisptachToProps)(AccquireInformation);
