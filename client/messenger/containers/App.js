import { connect } from 'react-redux';
import { App } from '../components';


const mapStateToProps = state => ({
  isMessengerVisible: state.isVisible,
  isEmailReceived: state.isEmailReceived,
});

export default connect(mapStateToProps)(App);
