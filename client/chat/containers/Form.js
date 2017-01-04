import { connect } from 'react-redux';
import { createConversation, cacheEmail } from '../actions/index';
import { Form } from '../components';

const mapStateToProps = state => ({
  isConversationSent: state.isConversationSent,
  cachedEmail: state.cachedEmail,
});

const mapDisptachToProps = dispatch => ({
  createConversation(content) {
    dispatch(createConversation(content));
  },

  cacheEmail(email) {
    dispatch(cacheEmail(email));
  },
});

export default connect(mapStateToProps, mapDisptachToProps)(Form);
