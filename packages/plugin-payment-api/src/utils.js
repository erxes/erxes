import { getSubdomain } from '@erxes/api-utils/src/core';
import { generateModels } from './connectionResolver';
import { sendQpayMessage } from './messageBroker';

export const callBackSocialPay = async (req, res) => {
  const subdomain = getSubdomain(req);

  console.log('call back socialPay url ...');
  console.log(req.query);

  const models = await generateModels(subdomain);

  return;
};

export const callBackQpay = async (req, res) => {
  const subdomain = getSubdomain(req);

  console.log('call back url ...');

  const models = await generateModels(subdomain);

  const { payment_id, qpay_payment_id } = req.query;

  console.log('payment_id, qpay_payment_id:', payment_id, qpay_payment_id);

  if (!payment_id || !qpay_payment_id) {
    return;
  }

  const requestData = { payment_id, qpay_payment_id };

  const response = await sendQpayMessage({
    subdomain,
    action: 'updateInvoice',
    data: requestData,
    isRPC: true
  });

  // const orderId = payment_id;
  // const paymentId = qpay_payment_id;
  // const invoice = await models.QPayInvoices.findOne({
  //   senderInvoiceNo: orderId
  // }).lean();
  // if (!invoice) {
  //   return;
  // }

  // await models.QPayInvoices.updateOne(
  //   { senderInvoiceNo: orderId },
  //   {
  //     $set: {
  //       paymentDate: new Date(),
  //       qpayPaymentId: paymentId,
  //       status: 'PAID'
  //     }
  //   }
  // );
  // const paidMobileAmount = await models.QPayInvoices.getPaidAmount(orderId);

  // const config: IConfigDocument =
  //   (await models.Configs.findOne({ token: invoice.token }).lean()) ||
  //   ({} as IConfigDocument);

  // await commonCheckPayment(
  //   subdomain,
  //   models,
  //   orderId,
  //   config,
  //   paidMobileAmount
  // );

  return response;
};
