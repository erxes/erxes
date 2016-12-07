import { connect } from 'react-redux';
import { App } from '../components';


const mapStateToProps = state => ({
  isMessengerVisible: state.messenger.isVisible,
});

export default connect(mapStateToProps)(App);
