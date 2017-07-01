import { connect } from 'react-redux';
import { connection } from '../connection';
import { App } from '../components';

const mapStateToProps = state => ({
  isMessengerVisible: state.isVisible,
  color: connection.data.uiOptions && connection.data.uiOptions.color,
});

export default connect(mapStateToProps)(App);
