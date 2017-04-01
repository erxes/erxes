import { connect } from 'react-redux';
import { App } from '../components';


const mapStateToProps = state => ({
  isFormVisible: state.isVisible,
});

export default connect(mapStateToProps)(App);
