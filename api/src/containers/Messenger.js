import { connect } from 'react-redux';
import { changeRoute } from '../actions/messenger';
import { changeConversation } from '../actions/conversations';
import { Messenger } from '../components';


const mapStateToProps = state => ({
  conversations: state.messenger.conversations,
  activeRoute: state.messenger.activeRoute,
});

const mapDispatchToProps = dispatch => ({
  goToConversationList(e) {
    e.preventDefault();

    // reset current conversation
    dispatch(changeConversation(''));

    dispatch(changeRoute('conversationList'));
  },
  createConversation(e) {
    e.preventDefault();

    dispatch(changeRoute('conversation'));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(Messenger);
