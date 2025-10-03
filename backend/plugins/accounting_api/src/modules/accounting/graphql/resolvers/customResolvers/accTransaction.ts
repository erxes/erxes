import { ITransactionDocument } from '@/accounting/@types/transaction';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';

export default {
  __resolveReference: async ({ _id }, { models }: IContext) => {
    return await models.Transactions.findOne({ _id });
  },

  async followTrs(transaction: ITransactionDocument, _, { models }: IContext) {
    if (!transaction.follows?.length) return;

    // return transaction.follows.map(f => dataLoaders.transaction.load(f.id))
    return await models.Transactions.find({
      _id: { $in: transaction.follows.map((f) => f.id) },
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

  async customer(transaction: ITransactionDocument) {
    if (!transaction.customerId) {
      return null;
    }

    if (transaction.customerType === 'visitor') {
      return null;
    }

    if (transaction.customerType === 'company') {
      const company = await sendTRPCMessage({
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
        primaryPhone: (user.details && user.details.operatorPhone) || '',
        primaryEmail: user.email,
        firstName: `${user.firstName || ''} ${user.lastName || ''}`,
        lastName: user.username,
      };
    }

    const customer = await sendTRPCMessage({
      method: 'query',
      pluginName: 'core',
      module: 'customer',
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
    const perPtrTrs = await models.Transactions.find({ ptrId: transaction.ptrId }, {
      sumCt: 1, sumDt: 1, journal: 1
    }).lean();

    const debit = perPtrTrs.reduce((sum, tr) => (tr.sumDt ?? 0) + sum, 0)
    const credit = perPtrTrs.reduce((sum, tr) => (tr.sumCt ?? 0) + sum, 0)
    return {
      len: perPtrTrs.length,
      activeLen: perPtrTrs.filter(tr => !tr.originId).length,
      status: perPtrTrs[0].ptrStatus,
      diff: Math.abs(debit - credit),
      value: Math.max(debit, credit)
    };
  }
};
