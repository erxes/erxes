import { getFullDate, getRandomNumber } from '../../../models/utils/utils';
import { getCalcedAmounts } from '../../../models/utils/transactionUtils';
import { checkPermission, paginate } from '@erxes/api-utils/src';
import { IContext } from '../../../connectionResolver';

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
    { commonQuerySelector, models }: IContext
  ) => {
    return paginate(
      models.Invoices.find(await generateFilter(params, commonQuerySelector)),
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
    { commonQuerySelector, models }: IContext
  ) => {
    const filter = await generateFilter(params, commonQuerySelector);

    return {
      list: paginate(models.Invoices.find(filter).sort(sortBuilder(params)), {
        page: params.page,
        perPage: params.perPage
      }),
      totalCount: models.Invoices.find(filter).count()
    };
  },

  /**
   * Get one invoice
   */

  invoiceDetail: async (_root, { _id }, { models }: IContext) => {
    return models.Invoices.getInvoice({ _id });
  },
  /**
   * Get invoice pre info
   */

  getInvoicePreInfo: async (
    _root,
    { contractId, payDate },
    { models, subdomain }: IContext
  ) => {
    const currentDate = getFullDate(payDate);
    const {
      payment,
      undue,
      interestEve,
      interestNonce,
      insurance,
      debt
    } = (await getCalcedAmounts(models, subdomain, {
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

checkPermission(invoiceQueries, 'handinvoicesler', 'showLoanInvoices');
checkPermission(invoiceQueries, 'invoicesMain', 'showLoanInvoices');
checkPermission(invoiceQueries, 'invoiceDetail', 'showLoanInvoices');

export default invoiceQueries;
