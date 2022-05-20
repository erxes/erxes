import Customers from '../../../models/Customers';
import messageBroker from '../../messageBroker';

interface IParams {
  firstName: string;
  lastName?: string;
  phone: string;
  email?: string;
  sex?: number;
}

const customerMutations = {
  async customersAdd(_root, params: IParams, { config }) {
    let customer;

    const response = await messageBroker().sendRPCMessage('erxes-pos-to-api', {
      action: 'newCustomer',
      posToken: config.token,
      data: {
        ...params,
        emailValidationStatus: 'valid',
        phoneValidationStatus: 'valid',
        primaryEmail: params.email,
        primaryPhone: params.phone,
        state: 'customer'
      }
    });

    if (response && response._id) {
      customer = await Customers.createCustomer(response);
    }

    return customer;
  }
};

export default customerMutations;
