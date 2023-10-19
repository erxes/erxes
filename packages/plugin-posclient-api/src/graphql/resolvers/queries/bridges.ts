import { sendContactsMessage, sendCoreMessage } from '../../../messageBroker';
import { IContext } from '../../types';

interface IListArgs {
  searchValue: string;
  type?: string;
  perPage?: number;
  page?: number;
}

const bridgesQueries = {
  async poscCustomers(
    _root,
    { searchValue, type, perPage, page }: IListArgs,
    { subdomain }: IContext
  ) {
    const limit = perPage || 20;
    const skip = ((page || 1) - 1) * limit;

    if (type === 'company') {
      const companies = await sendContactsMessage({
        subdomain,
        action: 'companies.findActiveCompanies',
        data: {
          selector: {
            $or: [
              { _id: searchValue },
              { code: searchValue },
              { primaryName: { $regex: searchValue, $options: 'i' } },
              { primaryEmail: { $regex: searchValue, $options: 'i' } },
              { primaryPhone: { $regex: searchValue, $options: 'i' } }
            ]
          },
          fields: {
            _id: 1,
            code: 1,
            primaryPhone: 1,
            primaryEmail: 1,
            primaryName: 1
          },
          skip,
          limit
        },
        isRPC: true
      });

      if (companies) {
        return companies.map(company => ({
          _id: company._id,
          code: company.code,
          primaryPhone: company.primaryPhone,
          primaryEmail: company.primaryEmail,
          firstName: company.primaryName,
          lastName: ''
        }));
      }
      return [];
    }

    if (type === 'user') {
      const users = await sendCoreMessage({
        subdomain,
        action: 'users.find',
        data: {
          query: {
            $or: [
              { _id: searchValue },
              { code: searchValue },
              { employeeId: searchValue },
              { email: { $regex: searchValue, $options: 'i' } },
              { username: { $regex: searchValue, $options: 'i' } },
              {
                'details.operatorPhone': { $regex: searchValue, $options: 'i' }
              }
            ]
          },
          fields: {
            _id: 1,
            code: 1,
            details: 1,
            email: 1,
            firstName: 1,
            lastName: 1,
            userName: 1
          },
          skip,
          limit
        },
        isRPC: true
      });

      if (users) {
        return users.map(user => ({
          _id: user._id,
          code: user.code,
          primaryPhone: (user.details && user.details.operatorPhone) || '',
          primaryEmail: user.email,
          firstName: `${user.firstName || ''} ${user.lastName || ''}`,
          lastName: user.username
        }));
      }
      return [];
    }

    const customers = await sendContactsMessage({
      subdomain,
      action: 'customers.findActiveCustomers',
      data: {
        selector: {
          $or: [
            { _id: searchValue },
            { code: searchValue },
            { primaryPhone: { $regex: searchValue, $options: 'i' } },
            { primaryEmail: { $regex: searchValue, $options: 'i' } },
            { firstName: { $regex: searchValue, $options: 'i' } },
            { lastName: { $regex: searchValue, $options: 'i' } },
            { middleName: { $regex: searchValue, $options: 'i' } }
          ]
        },
        fields: {
          _id: 1,
          code: 1,
          primaryPhone: 1,
          primaryEmail: 1,
          firstName: 1,
          lastName: 1
        },
        skip,
        limit
      },
      isRPC: true
    });

    if (customers) {
      return customers.map(customer => ({
        _id: customer._id,
        code: customer.code,
        primaryPhone: customer.primaryPhone,
        primaryEmail: customer.primaryEmail,
        firstName: customer.firstName,
        lastName: customer.lastName
      }));
    }
    return;
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
          primaryEmail: company.primaryEmail,
          firstName: company.primaryName,
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
          primaryEmail: user.email,
          firstName: `${user.firstName || ''} ${user.lastName || ''}`,
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
        primaryEmail: customer.primaryEmail,
        firstName: customer.firstName,
        lastName: customer.lastName
      };
    }
    return;
  }
};

export default bridgesQueries;
