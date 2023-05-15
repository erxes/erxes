import { sendContactsMessage, sendCoreMessage } from '../../../messageBroker';
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
          code: 1,
          primaryAddress: 1,
          addresses: 1
        }
      },
      isRPC: true,
      defaultValue: []
    });
  },

  async poscCustomerDetail(
    _root,
    { _id, type }: { _id: string; type?: string },
    { subdomain }: IContext
  ) {
    if (type === 'company') {
      const company = await sendContactsMessage({
        subdomain,
        action: 'companies.findOne',
        data: {
          _id,
          companyPrimaryName: _id,
          primaryName: _id,
          primaryEmail: _id,
          primaryPhone: _id,
          companyPrimaryEmail: _id,
          companyPrimaryPhone: _id,
          companyCode: _id
        },
        isRPC: true
      });

      if (company) {
        return {
          _id: company._id,
          code: company.code,
          primaryPhone: company.primaryPhone,
          firstName: company.primaryName,
          primaryEmail: company.primaryEmail,
          lastName: ''
        };
      }
      return;
    }

    if (type === 'user') {
      const user = await sendCoreMessage({
        subdomain,
        action: 'users.findOne',
        data: {
          $or: [
            { _id },
            { email: _id },
            { code: _id },
            { username: _id },
            { employeeId: _id },
            { 'details.operatorPhone': _id }
          ]
        },
        isRPC: true
      });

      if (user) {
        return {
          _id: user._id,
          code: user.code,
          primaryPhone: (user.details && user.details.operatorPhone) || '',
          firstName: `${user.firstName || ''} ${user.lastName || ''}`,
          primaryEmail: user.email,
          lastName: user.username
        };
      }
      return;
    }

    const customer = await sendContactsMessage({
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

    if (customer) {
      return {
        _id: customer._id,
        code: customer.code,
        primaryPhone: customer.primaryPhone,
        firstName: customer.firstName,
        primaryEmail: customer.primaryEmail,
        lastName: customer.lastName
      };
    }
    return;
  }
};

export default bridgesQueries;
