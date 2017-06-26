import { connect } from 'react-redux';
import { MessagesList } from '../components';
import { saveEmail } from '../actions/messenger';


const mapStateToProps = state => ({
  isObtainedEmail: state.isObtainedEmail,
});

const mapDisptachToProps = dispatch => ({
  saveEmail(e) {
    e.preventDefault();

    dispatch(saveEmail(document.querySelector('#visitor-email').value));
  },
});

export default connect(mapStateToProps, mapDisptachToProps)(MessagesList);
