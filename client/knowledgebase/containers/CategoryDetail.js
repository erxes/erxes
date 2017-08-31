import { connect } from 'react-redux';
import { CategoryDetail } from '../components';

const mapStateToProps = (state, ownProps) => ({
  ...ownProps,
});

export default connect(mapStateToProps)(CategoryDetail);
