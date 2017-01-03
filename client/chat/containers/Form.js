import { connect } from 'react-redux';
import { createConversation } from '../actions/index';
import { Form } from '../components';


const mapDisptachToProps = dispatch => ({
  createConversation(content) {
    dispatch(createConversation(content));
  },
});

export default connect(() => ({}), mapDisptachToProps)(Form);
