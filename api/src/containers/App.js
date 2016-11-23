import { connect } from 'react-redux';
import { App } from '../components';


const mapStateToProps = state => ({
  isChatVisible: state.chat.isVisible,
});

export default connect(mapStateToProps)(App);
