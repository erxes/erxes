import { generateModels } from './connectionResolver';
import { ISendMessageArgs, sendMessage } from '@erxes/api-utils/src/core';
import { serviceDiscovery } from './configs';
import { debugBase } from '@erxes/api-utils/src/debuggers';
import {
  hmac256,
  makeInvoiceNo,
  socialPayInvoiceCheck,
  socialPayInvoicePhone,
  socialPayInvoiceQR
} from './utilsGolomtSP';

let client;

export const initBroker = async cl => {
  client = cl;

  const { consumeRPCQueue } = cl;

  consumeRPCQueue('socialPay:checkInvoice', async ({ subdomain, data }) => {
    debugBase(`Receiving queue data: ${JSON.stringify(data)}`);
    const models = await generateModels(subdomain);
    const { config, invoiceId } = data;
    const { inStoreSPTerminal, inStoreSPKey } = config;

    const invoice = await models.SocialPayInvoice.getSocialPayInvoice(
      invoiceId
    );

    const amount = invoice.amount;
    const checksum = await hmac256(
      inStoreSPKey,
      inStoreSPTerminal + invoiceId + amount
    );

    const requestBody = {
      amount,
      checksum,
      invoice: invoiceId,
      terminal: inStoreSPTerminal
    };
    const response = await socialPayInvoiceCheck(requestBody, config);

    if (
      response &&
      response.header.code === 200 &&
      response.body.response.resp_desc &&
      response.body.response.resp_desc === 'Амжилттай'
    ) {
      await models.SocialPayInvoice.socialPayInvoiceStatusUpdate(
        invoice,
        'paid'
      );
    }

    return {
      status: 'success',
      data: response
    };
  });

  consumeRPCQueue('socialPay:createInvoice', async ({ subdomain, data }) => {
    debugBase(`Receiving queue data: ${JSON.stringify(data)}`);

    const models = await generateModels(subdomain);
    const { amount, phone, config } = data;
    const invoiceNo = await makeInvoiceNo(32);
    const { inStoreSPTerminal, inStoreSPKey } = config;

    const checksum = phone
      ? await hmac256(
          inStoreSPKey,
          inStoreSPTerminal + invoiceNo + amount + phone
        )
      : await hmac256(inStoreSPKey, inStoreSPTerminal + invoiceNo + amount);

    const doc = { amount, invoiceNo };
    const docLast = phone ? { ...doc, phone } : doc;

    const invoiceLog = await models.SocialPayInvoice.socialPayInvoiceCreate(
      docLast
    );

    const requestBody = {
      amount,
      checksum,
      invoice: invoiceNo,
      terminal: inStoreSPTerminal
    };

    const requestBodyPhone = phone ? { ...requestBody, phone } : requestBody;

    const invoiceQrData = phone
      ? await socialPayInvoicePhone(requestBodyPhone, config)
      : await socialPayInvoiceQR(requestBody, config);

    const qrText =
      invoiceQrData.body &&
      invoiceQrData.body.response &&
      invoiceQrData.body.response.desc
        ? invoiceQrData.body.response.desc
        : '';

    console.log(requestBody, invoiceQrData);

    if (qrText) {
      await models.SocialPayInvoice.socialPayInvoiceUpdate(invoiceLog, qrText);
    }

    return {
      status: 'success',
      data: {
        status: 'socialPay success',
        data: { qr: qrText, invoiceNo }
      }
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
