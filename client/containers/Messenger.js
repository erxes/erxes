import { connect } from 'react-redux';
import { Messenger } from '../components';


const mapStateToProps = state => ({
  activeRoute: state.activeRoute,
});

export default connect(mapStateToProps)(Messenger);
