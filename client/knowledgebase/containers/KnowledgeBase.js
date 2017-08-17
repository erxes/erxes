import { connect } from 'react-redux';
import { KnowledgeBase } from '../components';
import { switchToCategoryDisplay, switchToTopicDisplay, updateSearchString } from '../actions';

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
  onUpdateSearchString(searchStr) {
    dispatch(updateSearchString(searchStr));
  },
});


export default connect(mapStateToProps, mapDisptachToProps)(KnowledgeBase);
