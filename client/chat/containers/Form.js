import { connect } from 'react-redux';
import { createConversation, cacheEmail, newConversation } from '../actions/index';
import { Form } from '../components';

const mapStateToProps = state => ({
  status: state.status,
  cachedEmail: state.cachedEmail,
});

const mapDisptachToProps = dispatch => ({
  createConversation(content) {
    dispatch(createConversation(content));
  },

  cacheEmail(email) {
    dispatch(cacheEmail(email));
  },

  newConversation() {
    dispatch(newConversation());
  },
});

export default connect(mapStateToProps, mapDisptachToProps)(Form);
