import { connect } from 'react-redux';
import { CategoryDetail } from '../components';

const mapStateToProps = (state, ownProps) => ({
  ...ownProps,
});

const mapDisptachToProps = dispatch => ({
});

export default connect(mapStateToProps, mapDisptachToProps)(CategoryDetail);
