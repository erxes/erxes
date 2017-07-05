import { connect } from 'react-redux';
import { connection } from '../connection';
import { App } from '../components';

const mapStateToProps = state => ({
  isMessengerVisible: state.isVisible,
  uiOptions: connection.data.uiOptions || {},
});

export default connect(mapStateToProps)(App);
