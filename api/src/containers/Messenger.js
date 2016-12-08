import { connect } from 'react-redux';
import { Messenger } from '../components';


const mapStateToProps = state => ({
  activeRoute: state.messenger.activeRoute,
});

export default connect(mapStateToProps)(Messenger);
