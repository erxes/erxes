import { connect } from 'react-redux';
import { App } from '../components';

const mapStateToProps = (state, ownProps) => ({
  ...ownProps,
});

export default connect(mapStateToProps)(App);
