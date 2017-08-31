import { connect } from 'react-redux';
import { ArticleDetail } from '../components';

const mapStateToProps = (state, ownProps) => ({
  ...ownProps,
});

export default connect(mapStateToProps)(ArticleDetail);
