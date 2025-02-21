import { getFullDate, getRandomNumber } from '../../../models/utils/utils';
import { checkPermission, paginate } from '@erxes/api-utils/src';
import { IContext } from '../../../connectionResolver';
import { getConfig } from '../../../messageBroker';
import { getCalcedAmountsOnDate } from '../../../models/utils/calcHelpers';

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

export const sortBuilder = (params) => {
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
    return await paginate(
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

  loanInvoicesMain: async (
    _root,
    params,
    { commonQuerySelector, models }: IContext
  ) => {
    const filter = await generateFilter(params, commonQuerySelector);

    return {
      list: await paginate(
        models.Invoices.find(filter).sort(sortBuilder(params)),
        {
          page: params.page,
          perPage: params.perPage
        }
      ),
      totalCount: await models.Invoices.find(filter).countDocuments()
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
    const config = await getConfig('loansConfig', subdomain, {});
    const contract = await models.Contracts.getContract({ _id: contractId });
    const { payment, loss, storedInterest, calcInterest, insurance, debt } =
      await getCalcedAmountsOnDate(models, contract, currentDate, config.calculationFixed);

    return {
      contractId: contractId,
      number: getRandomNumber(),
      payDate: currentDate,
      payment,
      storedInterest,
      calcInterest,
      loss,
      debt,
      insurance,
      total:
        (payment || 0) +
        (storedInterest || 0) +
        (calcInterest || 0) +
        (loss || 0) +
        (insurance || 0) +
        (debt || 0)
    };
  }
};

checkPermission(invoiceQueries, 'handinvoicesler', 'showLoanInvoices');
checkPermission(invoiceQueries, 'invoicesMain', 'showLoanInvoices');
checkPermission(invoiceQueries, 'invoiceDetail', 'showLoanInvoices');

export default invoiceQueries;
