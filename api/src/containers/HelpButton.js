import { connect } from 'react-redux';
import { Chat, Customer } from '../actions';

import HelpButton from '../components/HelpButton';

const mapStateToProps = (state, ownProps) => {
  const customers = state.customers || [];
  const customer = customers.find(c => c.email === ownProps.email) || {};
  return { customer };
};

const mapDispatchToProps = (dispatch, ownProps) => ({
  onLauncherClick() {
    !ownProps.isVisible ? dispatch(Chat.show()) : dispatch(Chat.hide());
    dispatch(Customer.readMessages(ownProps.email));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(HelpButton);
