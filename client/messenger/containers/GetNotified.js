import { connect } from 'react-redux';
import { connection } from '../connection';
import { GetNotified } from '../components';
import { saveGetNotifedValue } from '../actions/messenger';

const mapStateToProps = state => ({
  color: connection.data.uiOptions && connection.data.uiOptions.color,
  isObtainedGetNotifiedType: state.isObtainedGetNotifiedType,
});

const mapDisptachToProps = dispatch => ({
  saveGetNotifedValue(type, value) {
    dispatch(saveGetNotifedValue(type, value));
  },
});

export default connect(mapStateToProps, mapDisptachToProps)(GetNotified);
