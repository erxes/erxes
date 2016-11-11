import { call } from '../erxes';


const Customer = {
  readMessages(email) {
    return (dispatch) => {
      dispatch({
        type: 'CUSTOMER_READ_MESSAGES',
        email,
      });

      return call('customerReadMessages')
        .catch((error) => {
          console.error(error); // eslint-disable-line no-console
        });
    };
  },
};

export default Customer;
