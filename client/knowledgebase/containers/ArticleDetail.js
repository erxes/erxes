import { connect } from 'react-redux';
import { ArticleDetail } from '../components';

const mapStateToProps = (state, ownProps) => ({
  ...ownProps,
});

const mapDisptachToProps = dispatch => ({
});

export default connect(mapStateToProps, mapDisptachToProps)(ArticleDetail);
