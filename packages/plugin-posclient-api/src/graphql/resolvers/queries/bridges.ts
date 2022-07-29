import { sendContactsMessage } from '../../../messageBroker';
import { IContext } from '../../types';

interface IListArgs {
  searchValue?: string;
}

const bridgesQueries = {
  async poscCustomers(
    _root,
    { searchValue }: IListArgs,
    { subdomain }: IContext
  ) {
    const filter: any = {};

    if (searchValue) {
      const regex = new RegExp(`${searchValue}`, 'i');

      filter.$or = [
        { primaryEmail: regex },
        { firstName: regex },
        { primaryPhone: regex },
        { lastName: regex }
      ];
    }

    return sendContactsMessage({
      subdomain,
      action: 'customers.find',
      data: {
        selector: filter,
        fields: {
          _id: 1,
          state: 1,
          createdAt: 1,
          modifiedAt: 1,
          avatar: 1,
          firstName: 1,
          lastName: 1,
          middleName: 1,
          birthDate: 1,
          sex: 1,
          email: 1,
          primaryEmail: 1,
          emails: 1,
          primaryPhone: 1,
          phones: 1,
          phone: 1,
          tagIds: 1,
          code: 1
        }
      },
      isRPC: true,
      defaultValue: []
    });
  },

  poscCustomerDetail(_root, { _id }: { _id: string }, { subdomain }: IContext) {
    return sendContactsMessage({
      subdomain,
      action: 'customers.findOne',
      data: {
        _id,
        customerCode: _id,
        customerPrimaryPhone: _id,
        customerPrimaryEmail: _id
      },
      isRPC: true
    });
  }
};

export default bridgesQueries;
