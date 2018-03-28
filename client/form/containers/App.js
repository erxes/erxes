import { connect } from 'react-redux';
import App from '../components/App';
import { closeModal } from '../actions';
import { connection } from '../connection';


const mapStateToProps = state => ({
  isShoutboxFormVisible: state.isShoutboxFormVisible,
  loadType: connection.data.formData.loadType,
  uiOptions: connection.data.uiOptions
});


const mapDisptachToProps = dispatch => ({
  onModalClose() {
    dispatch(closeModal);
  },
});

export default connect(mapStateToProps, mapDisptachToProps)(App);
