import { connect } from 'react-redux';
import { switchToArticleDisplay, switchToTopicDisplay } from '../actions';
import { App } from '../components';

const mapStateToProps = state => ({
  displayType: state.displayType,
});

const mapDispatchToProps = dispatch => ({
  onSwitchToArticleDisplay() {
    dispatch(switchToArticleDisplay);
  },
  onSwitchToTopicDisplay() {
    dispatch(switchToTopicDisplay);
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(App);
