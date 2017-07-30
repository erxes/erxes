import { connect } from 'react-redux';
import { connection } from '../connection';
import { App } from '../components';

const mapStateToProps = state => ({
  isKbVisible: state.isVisible,
  uiOptions: connection.data.uiOptions || {},
});

const mapDisptachToProps = dispatch => ({
});


export default connect(mapStateToProps, mapDisptachToProps)(App);
