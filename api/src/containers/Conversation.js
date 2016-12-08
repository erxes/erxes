import { connect } from 'react-redux';
import { changeConversation } from '../actions/conversations';
import { changeRoute } from '../actions/messenger';
import { Conversation } from '../components';


const mapDisptachToProps = dispatch => ({
  goToConversationList(e) {
    e.preventDefault();

    // reset current conversation
    dispatch(changeConversation(''));

    dispatch(changeRoute('conversationList'));
  },
});

export default connect(null, mapDisptachToProps)(Conversation) ;
