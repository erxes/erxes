import { connect } from 'react-redux';
import { Article } from '../components';
import { switchToArticleDisplay, switchToTopicDisplay } from '../actions';

const mapStateToProps = (state, ownProps) => ({
  ...ownProps,
});

const mapDisptachToProps = dispatch => ({
  onSwitchToArticleDisplay(article) {
    dispatch(switchToArticleDisplay(article));
  },
});

export default connect(mapStateToProps, mapDisptachToProps)(Article);
