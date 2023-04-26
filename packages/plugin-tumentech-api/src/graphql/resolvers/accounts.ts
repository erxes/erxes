import { ICustomerAccount } from '../../models/definitions/customerAccount';

const CustomerAccount = {
  async customer(account: ICustomerAccount, _params) {
    return (
      account.customerId && {
        __typename: 'Customer',
        _id: account.customerId
      }
    );
  }
};

export { CustomerAccount };
