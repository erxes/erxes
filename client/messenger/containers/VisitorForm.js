import { connect } from 'react-redux';
import { connection } from '../connection';
import { sendVisitorFirstMessage } from '../actions/messenger';
import { VisitorForm } from '../components';

const mapStateToProps = () => ({
  data: connection.data,
});

const mapDisptachToProps = dispatch => ({
  sendVisitorFirstMessage(...args) {
    dispatch(sendVisitorFirstMessage(...args));
  },
});

export default connect(mapStateToProps, mapDisptachToProps)(VisitorForm);
