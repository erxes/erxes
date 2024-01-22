import { IModels } from '../../connectionResolver';
import { INVOICE_STATUS } from '../definitions/constants';
import { IContractDocument } from '../definitions/contracts';
import { IInvoice, IInvoiceDocument } from '../definitions/invoices';
import { getPaymentInfo } from './paymentUtils';

export async function createInvoice(
  contract: IContractDocument,
  payDate: Date,
  models: IModels
): Promise<IInvoiceDocument> {
  const paymentInfo = await getPaymentInfo(contract, payDate, models);
  const invoiceData: IInvoice = {
    contractId: contract._id,
    payment: paymentInfo.payment,
    payDate: paymentInfo.payDate,
    calcInterest: paymentInfo.calcInterest,
    storedInterest: paymentInfo.storedInterest,
    debt: paymentInfo.debt,
    insurance: paymentInfo.insurance,
    undue: paymentInfo.undue,
    total: paymentInfo.total,
    createdAt: new Date(),
    interestEve: 0,
    interestNonce: 0,
    number: contract.number,
    commitmentInterest: paymentInfo.commitmentInterest,
    customerId: contract.customerId,
    status: INVOICE_STATUS.PENDING
  };

  const invoice = await models.Invoices.create(invoiceData);

  return invoice;
}
