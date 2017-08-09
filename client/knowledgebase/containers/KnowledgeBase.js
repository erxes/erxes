import { connect } from 'react-redux';
import { KnowledgeBase } from '../components';
import { switchToTopicDisplay, updateSearchString } from '../actions';

const mapStateToProps = state => ({
  displayType: state.displayType,
});

const mapDisptachToProps = dispatch => ({
  onSwitchToTopicDisplay() {
    dispatch(switchToTopicDisplay());
  },
  onUpdateSearchString(searchStr) {
    dispatch(updateSearchString(searchStr));
  }
});


export default connect(mapStateToProps, mapDisptachToProps)(KnowledgeBase);
