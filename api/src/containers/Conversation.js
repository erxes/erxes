import { connect } from 'react-redux';
import { changeRoute, changeConversation } from '../actions/messenger';
import { Conversation } from '../components';


const mapStateToProps = state => {
  const lastStaffMessage = state.messages.find(m => m.userId);
  const user = state.users && lastStaffMessage &&
    state.users.find(u => u._id === lastStaffMessage.userId);

  const isNewConversation = !state.activeConversation;

  return { user, isNewConversation };
};

const mapDisptachToProps = dispatch => ({
  goToConversationList(e) {
    e.preventDefault();

    // reset current conversation
    dispatch(changeConversation(''));

    dispatch(changeRoute('conversationList'));
  },
});

export default connect(mapStateToProps, mapDisptachToProps)(Conversation);
