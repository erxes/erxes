import { IContext } from '../../connectionResolver';
import { sendCoreMessage } from '../../messageBroker';
import { ITransactionDocument } from '../../models/definitions/transaction';

export default {
  __resolveReference({ _id }, { models }: IContext) {
    return models.Transactions.findOne({ _id });
  },

  async followTrs(transaction: ITransactionDocument, _, { dataLoaders }: IContext) {
    if (!transaction.follows?.length)
      return;

    return transaction.follows.map(f => dataLoaders.transaction.load(f.id))
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

  async branch(transaction: ITransactionDocument, _, { subdomain }: IContext) {
    if (!transaction.branchId) {
      return;
    }

    return await sendCoreMessage({
      subdomain,
      action: 'branches.findOne',
      data: { _id: transaction.branchId },
      isRPC: true,
      defaultValue: {}
    });
  },

  async department(transaction: ITransactionDocument, _, { subdomain }: IContext) {
    if (!transaction.departmentId) {
      return;
    }

    return await sendCoreMessage({
      subdomain,
      action: 'departments.findOne',
      data: { _id: transaction.departmentId },
      isRPC: true,
      defaultValue: {}
    });
  },

  async customer(transaction: ITransactionDocument, _params, { subdomain }: IContext) {
    if (!transaction.customerId) {
      return null;
    }

    if (transaction.customerType === "visitor") {
      return null;
    }

    if (transaction.customerType === "company") {
      const company = await sendCoreMessage({
        subdomain,
        action: "companies.findOne",
        data: { _id: transaction.customerId },
        isRPC: true,
        defaultValue: {}
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
        lastName: ""
      };
    }

    if (transaction.customerType === "user") {
      const user = await sendCoreMessage({
        subdomain,
        action: "users.findOne",
        data: { _id: transaction.customerId },
        isRPC: true,
        defaultValue: {}
      });

      if (!user?._id) {
        return null;
      }

      return {
        _id: user._id,
        code: user.code,
        primaryPhone: (user.details && user.details.operatorPhone) || "",
        primaryEmail: user.email,
        firstName: `${user.firstName || ""} ${user.lastName || ""}`,
        lastName: user.username
      };
    }

    const customer = await sendCoreMessage({
      subdomain,
      action: "customers.findOne",
      data: { _id: transaction.customerId },
      isRPC: true,
      defaultValue: {}
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
      lastName: customer.lastName
    };
  },
};
