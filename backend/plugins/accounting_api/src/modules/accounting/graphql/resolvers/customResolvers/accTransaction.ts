import { ITransactionDocument } from '@/accounting/@types/transaction';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';
import {
  EMPTY_PTR_INFO,
  summarizePtr,
} from '@/accounting/utils/transactionListRows';

export default {
  __resolveReference: async ({ _id }, { models }: IContext) => {
    return await models.Transactions.findOne({ _id });
  },

  async followTrs(transaction: ITransactionDocument, _, { models }: IContext) {
    return await models.Transactions.find({
      originId: transaction._id,
    }).lean();
  },

  async vatRow(transaction: ITransactionDocument, _, { models }: IContext) {
    if (!transaction.vatRowId) {
      return;
    }

    return await models.VatRows.findOne({ _id: transaction.vatRowId });
  },

  async ctaxRow(transaction: ITransactionDocument, _, { models }: IContext) {
    if (!transaction.ctaxRowId) {
      return;
    }

    return await models.CtaxRows.findOne({ _id: transaction.ctaxRowId });
  },

  async branch(transaction: ITransactionDocument) {
    if (!transaction.branchId) {
      return;
    }

    return {
      __typename: 'Branch',
      _id: transaction.branchId,
    };
  },

  async department(transaction: ITransactionDocument) {
    if (!transaction.departmentId) {
      return;
    }

    return {
      __typename: 'Department',
      _id: transaction.departmentId,
    };
  },

  async customer(
    transaction: ITransactionDocument,
    _params,
    { subdomain }: IContext,
  ) {
    if (!transaction.customerId) {
      return null;
    }

    if (transaction.customerType === 'visitor') {
      return null;
    }

    if (transaction.customerType === 'company') {
      const company = await sendTRPCMessage({
        subdomain,

        method: 'query',
        pluginName: 'core',
        module: 'company',
        action: 'findOne',
        input: { query: { _id: transaction.customerId } },
        defaultValue: {},
      });

      if (!company?._id) {
        return null;
      }

      return {
        _id: company._id,
        code: company.code,
        primaryPhone: company.primaryPhone,
        primaryEmail: company.primaryEmail,
        firstName: company.primaryName,
        lastName: '',
      };
    }

    if (transaction.customerType === 'user') {
      const user = await sendTRPCMessage({
        subdomain,

        method: 'query',
        pluginName: 'core',
        module: 'users',
        action: 'findOne',
        input: { query: { _id: transaction.customerId } },
        defaultValue: {},
      });

      if (!user?._id) {
        return null;
      }

      return {
        _id: user._id,
        code: user.code,
        primaryPhone: user.details?.operatorPhone ?? '',
        primaryEmail: user.email ?? '',
        firstName: `${user.firstName || ''} ${user.lastName || ''}`,
        lastName: user.username,
      };
    }

    const customer = await sendTRPCMessage({
      subdomain,
      method: 'query',
      pluginName: 'core',
      module: 'customers',
      action: 'findOne',
      input: { query: { _id: transaction.customerId } },
      defaultValue: {},
    });
    if (!customer?._id) {
      return null;
    }

    return {
      _id: customer._id,
      code: customer.code,
      primaryPhone: customer.primaryPhone,
      primaryEmail: customer.primaryEmail,
      firstName: customer.firstName,
      lastName: customer.lastName,
    };
  },

  assignedUsers(transaction: ITransactionDocument) {
    if (!transaction.assignedUserIds?.length) {
      return;
    }

    return transaction.assignedUserIds.map((aui) => ({
      __typename: 'User',
      _id: aui,
    }));
  },

  async ptrInfo(transaction: ITransactionDocument, _, { models }: IContext) {
    if (!transaction.ptrId) {
      return EMPTY_PTR_INFO;
    }

    const perPtrTrs = await models.Transactions.find(
      { ptrId: transaction.ptrId },
      {
        sumCt: 1,
        sumDt: 1,
        journal: 1,
        originId: 1,
        ptrStatus: 1,
      },
    ).lean();

    return summarizePtr(perPtrTrs);
  },
};
