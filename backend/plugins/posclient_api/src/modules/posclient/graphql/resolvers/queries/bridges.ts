import { markResolvers, sendTRPCMessage } from 'erxes-api-shared/utils';
import { IContext } from '~/modules/posclient/@types/types';
import { assertPosUser } from '~/modules/posclient/utils/assertPosUser';
import { checkLoyalties } from '~/modules/posclient/utils/loyalties';
import {
  canCreateCustomer,
  resolveCustomerForm,
} from '~/modules/posclient/utils/customerCreate';

export interface IListArgs {
  searchValue: string;
  type?: string;
  perPage?: number;
  page?: number;
}

const bridgesQueries = {
  async poscCustomers(
    _root,
    { searchValue, type, perPage, page }: IListArgs,
    { subdomain }: IContext,
  ) {
    const limit = perPage || 20;
    const skip = ((page || 1) - 1) * limit;

    if (type === 'company') {
      const companies = await sendTRPCMessage({
        subdomain,

        method: 'query',
        pluginName: 'core',
        module: 'companies',
        action: 'findActiveCompanies',
        input: {
          query: {
            $or: [
              { _id: searchValue },
              { code: searchValue },
              { primaryName: { $regex: searchValue, $options: 'i' } },
              { primaryEmail: { $regex: searchValue, $options: 'i' } },
              { primaryPhone: { $regex: searchValue, $options: 'i' } },
            ],
          },
          fields: {
            _id: 1,
            code: 1,
            primaryPhone: 1,
            primaryEmail: 1,
            primaryName: 1,
          },
          skip,
          limit,
        },
        defaultValue: [],
      });

      if (companies) {
        return companies.map((company) => ({
          _id: company._id,
          code: company.code,
          primaryPhone: company.primaryPhone,
          primaryEmail: company.primaryEmail,
          firstName: company.primaryName,
          lastName: '',
        }));
      }
      return [];
    }

    if (type === 'user') {
      const users = await sendTRPCMessage({
        subdomain,

        method: 'query',
        pluginName: 'core',
        module: 'users',
        action: 'find',
        input: {
          query: {
            $or: [
              { _id: searchValue },
              { code: searchValue },
              { employeeId: searchValue },
              { email: { $regex: searchValue, $options: 'i' } },
              { username: { $regex: searchValue, $options: 'i' } },
              {
                'details.operatorPhone': { $regex: searchValue, $options: 'i' },
              },
            ],
          },
          fields: {
            _id: 1,
            code: 1,
            details: 1,
            email: 1,
            firstName: 1,
            lastName: 1,
            userName: 1,
          },
          skip,
          limit,
        },
        defaultValue: [],
      });

      if (users) {
        return users.map((user) => ({
          _id: user._id,
          code: user.code,
          primaryPhone: user?.details?.operatorPhone || '',
          primaryEmail: user.email,
          firstName: `${user.firstName || ''} ${user.lastName || ''}`,
          lastName: user.username,
        }));
      }
      return [];
    }
    const customers = await sendTRPCMessage({
      subdomain,

      method: 'query',
      pluginName: 'core',
      module: 'customers',
      action: 'findActiveCustomers',
      input: {
        query: {
          $or: [
            { _id: searchValue },
            { code: searchValue },
            { primaryPhone: { $regex: searchValue, $options: 'i' } },
            { primaryEmail: { $regex: searchValue, $options: 'i' } },
            { firstName: { $regex: searchValue, $options: 'i' } },
            { lastName: { $regex: searchValue, $options: 'i' } },
            { middleName: { $regex: searchValue, $options: 'i' } },
          ],
        },
        fields: {
          _id: 1,
          code: 1,
          primaryPhone: 1,
          primaryEmail: 1,
          firstName: 1,
          lastName: 1,
        },
        skip,
        limit,
      },
      defaultValue: [],
    });

    if (customers) {
      return customers.map((customer) => ({
        _id: customer._id,
        code: customer.code,
        primaryPhone: customer.primaryPhone,
        primaryEmail: customer.primaryEmail,
        firstName: customer.firstName,
        lastName: customer.lastName,
      }));
    }
    return;
  },

  async poscCustomerDetail(
    _root,
    { _id, type }: { _id: string; type?: string },
    { subdomain }: IContext,
  ) {
    if (type === 'company') {
      const company = await sendTRPCMessage({
        subdomain,

        method: 'query',
        pluginName: 'core',
        module: 'companies',
        action: 'findOne',
        input: {
          query: {
            _id,
          },
        },
        defaultValue: null,
      });

      if (company) {
        return {
          _id: company._id,
          code: company.code,
          primaryPhone: company.primaryPhone,
          primaryEmail: company.primaryEmail,
          firstName: company.primaryName,
          lastName: '',
        };
      }
      return;
    }

    if (type === 'user') {
      const user = await sendTRPCMessage({
        subdomain,

        method: 'query',
        pluginName: 'core',
        module: 'users',
        action: 'findOne',
        input: {
          $or: [
            { _id },
            { email: _id },
            { code: _id },
            { username: _id },
            { employeeId: _id },
            { 'details.operatorPhone': _id },
          ],
        },
        defaultValue: null,
      });
      // const user = await sendCoreMessage({
      //   subdomain,
      //   action: 'users.findOne',
      //   data: {
      //     $or: [
      //       { _id },
      //       { email: _id },
      //       { code: _id },
      //       { username: _id },
      //       { employeeId: _id },
      //       { 'details.operatorPhone': _id },
      //     ],
      //   },
      //   isRPC: true,
      // });

      if (user) {
        return {
          _id: user._id,
          code: user.code,
          primaryPhone: user?.details?.operatorPhone || '',
          primaryEmail: user.email,
          firstName: `${user.firstName || ''} ${user.lastName || ''}`,
          lastName: user.username,
        };
      }
      return;
    }
    const customer = await sendTRPCMessage({
      subdomain,

      method: 'query',
      pluginName: 'core',
      module: 'customers',
      action: 'findOne',
      input: {
        query: { _id },
      },
      defaultValue: null,
    });

    if (customer) {
      return {
        _id: customer._id,
        code: customer.code,
        primaryPhone: customer.primaryPhone,
        primaryEmail: customer.primaryEmail,
        firstName: customer.firstName,
        lastName: customer.lastName,
      };
    }
    return;
  },

  // Shown to the cashier only for the customer chosen on the order.
  async poscCustomerLoyalty(
    _root,
    { customerId, totalAmount }: { customerId: string; totalAmount?: number },
    { subdomain, posUser }: IContext,
  ) {
    assertPosUser(posUser);

    return sendTRPCMessage({
      subdomain,
      pluginName: 'loyalty',
      method: 'query',
      module: 'loyalty',
      action: 'ownerSummary',
      input: { ownerType: 'customer', ownerId: customerId, totalAmount },
      defaultValue: null,
    });
  },

  // Checked when typed in, so a bad code never sticks to the order; returns the campaign title.
  async poscCouponCheck(
    _root,
    {
      code,
      customerId,
      totalAmount,
    }: { code: string; customerId?: string; totalAmount?: number },
    { subdomain, posUser }: IContext,
  ) {
    assertPosUser(posUser);

    const campaign = await sendTRPCMessage({
      subdomain,
      pluginName: 'loyalty',
      method: 'query',
      module: 'coupon',
      action: 'checkCoupon',
      input: { code, ownerId: customerId, totalAmount },
      throwOnError: true,
    });

    if (!campaign) {
      throw new Error('Coupons are not available on this POS');
    }

    return campaign.title || code;
  },

  // The loyalty discount a save would give each line, computed without saving.
  async poscLoyaltyPreview(
    _root,
    {
      items,
      customerId,
      couponCode,
      voucherId,
    }: {
      items: { productId: string; count: number; unitPrice: number }[];
      customerId?: string;
      couponCode?: string;
      voucherId?: string;
    },
    { subdomain, posUser }: IContext,
  ) {
    assertPosUser(posUser);

    const doc = await checkLoyalties(subdomain, {
      items: items.map((item, index) => ({ ...item, _id: String(index) })),
      customerId,
      couponCode,
      voucherId,
      totalAmount: 0,
      type: '',
      description: '',
    });

    return doc.items.flatMap(({ productId, discountInfos }) => {
      const loyalty = (discountInfos || []).find(
        ({ type }) => type === 'voucher',
      );

      return loyalty?.percent
        ? [{ productId, percent: loyalty.percent, title: loyalty.title }]
        : [];
    });
  },

  async poscCustomerForm(
    _root,
    _args,
    { subdomain, config, posUser }: IContext,
  ) {
    if (!canCreateCustomer(config, posUser)) {
      return { canCreate: false, rows: [] };
    }

    return {
      canCreate: true,
      rows: await resolveCustomerForm(
        subdomain,
        config.customerCreateConfig?.layout || [],
      ),
    };
  },
};

markResolvers<IContext>(bridgesQueries, {
  wrapperConfig: {
    skipPermission: true,
  },
});

export default bridgesQueries;
