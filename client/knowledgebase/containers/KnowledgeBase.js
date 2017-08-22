import { connect } from 'react-redux';
import { KnowledgeBase } from '../components';
import { switchToCategoryDisplay, switchToTopicDisplay } from '../actions';

const mapStateToProps = state => ({
  displayType: state.displayType,
});

const mapDisptachToProps = dispatch => ({
  onSwitchToTopicDisplay() {
    dispatch(switchToTopicDisplay());
  },
  onSwitchToCategoryDisplay(category) {
    dispatch(switchToCategoryDisplay(category));
  },
});


export default connect(mapStateToProps, mapDisptachToProps)(KnowledgeBase);
