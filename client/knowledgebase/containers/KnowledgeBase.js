import { connect } from 'react-redux';
import { KnowledgeBase } from '../components';


const mapStateToProps = state => ({
  activeRoute: state.activeRoute,
});

export default connect(mapStateToProps)(KnowledgeBase);
