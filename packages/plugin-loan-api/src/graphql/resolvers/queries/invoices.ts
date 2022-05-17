import { paginate } from 'erxes-api-utils';
import { getFullDate, getRandomNumber } from '../../../models/utils/utils';
import { getCalcedAmounts } from '../../../models/utils/transactionUtils';
import { checkPermission } from '@erxes/api-utils/src';

const generateFilter = async (params, commonQuerySelector) => {
  const filter: any = commonQuerySelector;

  if (params.number) {
    filter.number = { $in: [new RegExp(`.*${params.number}.*`, 'i')] };
  }

  if (params.ids) {
    filter._id = { $in: params.ids };
  }

  if (params.contractId) {
    filter.contractId = params.contractId;
  }

  if (params.companyId) {
    filter.companyId = params.companyId;
  }

  if (params.customerId) {
    filter.customerId = params.customerId;
  }

  if (params.payDate1) {
    filter.payDate = {
      $gte: new Date(params.payDate1)
    };
  }

  if (params.payDate2) {
    filter.payDate = {
      $lte: new Date(params.payDate2)
    };
  }

  return filter;
};

export const sortBuilder = params => {
  const sortField = params.sortField;
  const sortDirection = params.sortDirection || 0;

  if (sortField) {
    return { [sortField]: sortDirection };
  }

  return {};
};

const invoiceQueries = {
  /**
   * Invoices list
   */

  handinvoicesler: async (
    _root,
    params,
    { commonQuerySelector, models, checkPermission, user }
  ) => {
    return paginate(
      models.LoanInvoices.find(
        await generateFilter(params, commonQuerySelector)
      ),
      {
        page: params.page,
        perPage: params.perPage
      }
    );
  },

  /**
   * Invoices for only main list
   */

  invoicesMain: async (
    _root,
    params,
    { commonQuerySelector, models, checkPermission, user }
  ) => {
    const filter = await generateFilter(params, commonQuerySelector);

    return {
      list: paginate(
        models.LoanInvoices.find(filter).sort(sortBuilder(params)),
        {
          page: params.page,
          perPage: params.perPage
        }
      ),
      totalCount: models.LoanInvoices.find(filter).count()
    };
  },

  /**
   * Get one invoice
   */

  invoiceDetail: async (_root, { _id }, { models, checkPermission, user }) => {
    return models.LoanInvoices.getInvoice(models, { _id });
  },
  /**
   * Get invoice pre info
   */

  getInvoicePreInfo: async (
    _root,
    { contractId, payDate },
    { models, memoryStorage }
  ) => {
    const currentDate = getFullDate(payDate);
    const {
      payment,
      undue,
      interestEve,
      interestNonce,
      insurance,
      debt
    } = (await getCalcedAmounts(models, memoryStorage, {
      contractId,
      payDate: currentDate
    })) as any;

    return {
      contractId: contractId,
      number: getRandomNumber(),
      payDate: currentDate,
      payment,
      interestEve,
      interestNonce,
      undue,
      debt,
      insurance,
      total:
        (payment || 0) +
        (interestEve || 0) +
        (interestNonce || 0) +
        (undue || 0) +
        (insurance || 0) +
        (debt || 0)
    };
  }
};

checkPermission(invoiceQueries, 'handinvoicesler', 'showInvoices');
checkPermission(invoiceQueries, 'invoicesMain', 'showInvoices');
checkPermission(invoiceQueries, 'invoiceDetail', 'showInvoices');

export default invoiceQueries;
