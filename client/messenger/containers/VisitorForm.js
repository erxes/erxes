import { connect } from 'react-redux';
import { sendVisitorFirstMessage } from '../actions/messenger';
import { VisitorForm } from '../components';

const mapStateToProps = () => ({});

const mapDisptachToProps = dispatch => ({
  sendVisitorFirstMessage(...args) {
    dispatch(sendVisitorFirstMessage(...args));
  },
});

export default connect(mapStateToProps, mapDisptachToProps)(VisitorForm);
