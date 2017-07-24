import { connect } from 'react-redux';
import { connection } from '../connection';
import { Messenger } from '../components';

const mapStateToProps = state => ({
  activeRoute: state.activeRoute,
  color: connection.data.uiOptions && connection.data.uiOptions.color,
});

export default connect(mapStateToProps)(Messenger);
