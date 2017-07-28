import { connect } from 'react-redux';
import { Topic } from '../components';


const mapStateToProps = state => ({
  activeRoute: state.activeRoute,
});

export default connect(mapStateToProps)(Topic);
