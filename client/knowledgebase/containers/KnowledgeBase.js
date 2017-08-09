import { connect } from 'react-redux';
import { KnowledgeBase } from '../components';
import { switchToArticleDisplay, switchToTopicDisplay } from '../actions';

const mapStateToProps = state => ({
  displayType: state.displayType,
});

const mapDisptachToProps = dispatch => ({
  onSwitchToArticleDisplay() {
    dispatch(switchToArticleDisplay);
  },
  onSwitchToTopicDisplay() {
    dispatch(switchToTopicDisplay);
  },
});


export default connect(mapStateToProps, mapDisptachToProps)(KnowledgeBase);
