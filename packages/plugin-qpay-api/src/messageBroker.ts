import { generateModels } from './connectionResolver';
import { ISendMessageArgs, sendMessage } from '@erxes/api-utils/src/core';
import { serviceDiscovery } from './configs';
import { debugBase } from '@erxes/api-utils/src/debuggers';
import {
  createInvoice,
  getQpayInvoice,
  makeInvoiceNo,
  qpayToken
} from './utils';

let client;

export const initBroker = async cl => {
  client = cl;
  const { consumeRPCQueue } = cl;

  consumeRPCQueue('qpay:checkInvoice', async ({ subdomain, data }) => {
    debugBase(`Receiving queue data: ${JSON.stringify(data)}`);
    const models = await generateModels(subdomain);
    const { config, invoiceId } = data;
    const token = await qpayToken(config);
    const invoice = await models.QpayInvoice.findOne({
      qpayInvoiceId: invoiceId
    });

    const detail = await getQpayInvoice(invoiceId, token, config);

    if (
      invoice &&
      !invoice.qpayPaymentId &&
      detail.invoice_status === 'CLOSED'
    ) {
      const payments = detail.payments;

      payments.map(async e => {
        const paymentId = e.payment_id;

        await models.QpayInvoice.updateOne(
          { qpayInvoiceId: invoiceId },
          {
            $set: {
              paymentDate: new Date(),
              qpayPaymentId: paymentId,
              status: 'PAID'
            }
          }
        );
      });
    }

    return {
      status: 'success',
      data: detail
    };
  });

  consumeRPCQueue('qpay:updateInvoice', async ({ subdomain, data }) => {
    debugBase(`Receiving queue data: ${JSON.stringify(data)}`);
    const models = await generateModels(subdomain);
    const { payment_id, qpay_payment_id } = data;

    await models.QpayInvoice.updateOne(
      { senderInvoiceNo: payment_id },
      {
        $set: {
          qpayPaymentId: qpay_payment_id,
          paymentDate: new Date(),
          status: 'paid'
        }
      }
    );

    return {
      status: 'success',
      data: { status: 'qpay invoice updated' }
    };
  });

  consumeRPCQueue('qpay:createInvoice', async ({ subdomain, data }) => {
    debugBase(`Receiving queue data: ${JSON.stringify(data)}`);

    const models = await generateModels(subdomain);
    const { config, invoice_description, amount } = data;
    const { qpayInvoiceCode, callbackUrl } = config;
    const invoice_receiver_code = 'terminal';
    const token = await qpayToken(config);
    const sender_invoice_no = await makeInvoiceNo(16);

    const invoiceDoc = {
      senderInvoiceNo: sender_invoice_no,
      amount
    };

    const invoice = await models.QpayInvoice.qpayInvoiceCreate(invoiceDoc);

    const varData = {
      invoice_code: qpayInvoiceCode,
      sender_invoice_no,
      invoice_receiver_code,
      invoice_description,
      amount,
      callback_url: `${callbackUrl}/callBackQpay?payment_id=${sender_invoice_no}`
    };

    const invoiceData = await createInvoice(varData, token, config);
    await models.QpayInvoice.qpayInvoiceUpdate(invoice, invoiceData);

    return {
      status: 'success',
      data: { status: 'qpay success', response: invoiceData }
    };
  });
};

export const sendCoreMessage = async (args: ISendMessageArgs): Promise<any> => {
  return sendMessage({
    client,
    serviceDiscovery,
    serviceName: 'core',
    ...args
  });
};

export const sendInternalNotesMessage = async (
  args: ISendMessageArgs
): Promise<any> => {
  return sendMessage({
    client,
    serviceDiscovery,
    serviceName: 'internalnotes',
    ...args
  });
};

export const sendCommonMessage = async (
  args: ISendMessageArgs & { serviceName: string }
): Promise<any> => {
  return sendMessage({
    serviceDiscovery,
    client,
    ...args
  });
};

export default function() {
  return client;
}
