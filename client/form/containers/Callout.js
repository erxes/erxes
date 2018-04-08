/* eslint-disable react/jsx-filename-extension */

import { connect } from 'react-redux';
import { Callout } from '../components';
import { showForm } from '../actions';

const mapStateToProps = () => ({});

const mapDispatchToProps = dispatch => ({
  onSubmit() {
    dispatch(showForm());
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(Callout);
