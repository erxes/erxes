import { connect } from 'react-redux';
import { connection } from '../connection';
import { Message } from '../components';

const mapStateToProps = () => ({
  color: connection.data.uiOptions && connection.data.uiOptions.color,
});

export default connect(mapStateToProps)(Message);
