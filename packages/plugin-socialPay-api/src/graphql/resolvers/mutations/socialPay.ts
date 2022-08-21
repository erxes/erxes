import {
  getConfig,
  makeInvoiceNo,
  hmac256,
  socialPayInvoicePhone,
  socialPayInvoiceQR,
  socialPayInvoiceCancel,
  socialPayPaymentCancel
} from '../../../utilsGolomtSP';

const Mutations = {
  /**
   * cancel payment socialPay invoice
   */

  cancelPaymentSPInvoice: async (_root, params, { models, subdomain }) => {
    const invoiceNo = params.invoiceNo;
    const config = await getConfig(subdomain, 'SocialPAY', {});
    const { inStoreSPTerminal, inStoreSPKey } = config;
    const invoice = await models.SocialPayInvoice.getSocialPayInvoice(
      models,
      invoiceNo
    );
    const amount = invoice.amount;
    const checksum = await hmac256(
      inStoreSPKey,
      amount + invoiceNo + inStoreSPTerminal
    );

    const requestBody = {
      amount,
      checksum,
      invoice: invoiceNo,
      terminal: inStoreSPTerminal
    };
    const invoiceQrData = await socialPayPaymentCancel(requestBody, config);
    const response =
      invoiceQrData.header && invoiceQrData.header.code
        ? invoiceQrData.header.code
        : 0;

    if (response === 200) {
      await models.SocialPayInvoice.socialPayInvoiceStatusUpdate(
        models,
        invoice,
        'canceled payment'
      );
    }

    return invoiceQrData;
  },

  /**
   * cancel socialPay invoice
   */

  cancelSPInvoice: async (_root, params, { subdomain, models }) => {
    const config = await getConfig(subdomain, 'SocialPAY', {});
    const invoiceNo = params.invoiceNo;
    const { inStoreSPTerminal, inStoreSPKey } = config;
    const invoice = await models.SocialPayInvoice.getSocialPayInvoice(
      models,
      invoiceNo
    );
    const amount = invoice.amount;
    const checksum = await hmac256(
      inStoreSPKey,
      inStoreSPTerminal + invoiceNo + amount
    );

    const requestBody = {
      amount,
      checksum,
      invoice: invoiceNo,
      terminal: inStoreSPTerminal
    };
    const invoiceQrData = await socialPayInvoiceCancel(requestBody, config);
    const response =
      invoiceQrData.header && invoiceQrData.header.code
        ? invoiceQrData.header.code
        : 0;
    const responseDesc =
      invoiceQrData.body &&
      invoiceQrData.body.response &&
      invoiceQrData.body.response.status
        ? invoiceQrData.body.response.status
        : 'UNSUCCESS';

    if (response === 200 && responseDesc === 'SUCCESS') {
      await models.SocialPayInvoice.socialPayInvoiceStatusUpdate(
        models,
        invoice,
        'canceled'
      );
    }

    return invoiceQrData;
  },

  /**
   * create socialPay invoice with QR
   */

  createSPInvoiceQr: async (_root, params, { subdomain, models }) => {
    const { amount } = params;
    const config = await getConfig(subdomain, 'SocialPAY', {});
    console.log(config, 'cccccccccccccc');

    const invoiceNo = params.invoiceNoAuto
      ? await makeInvoiceNo(32)
      : params.invoice;

    const { inStoreSPTerminal, inStoreSPKey } = config;
    const checksum = await hmac256(
      inStoreSPKey,
      inStoreSPTerminal + invoiceNo + amount
    );
    const doc = { amount, invoiceNo };
    const invoiceLog = await models.SocialPayInvoice.socialPayInvoiceCreate(
      models,
      doc
    );

    const requestBody = {
      amount,
      checksum,
      invoice: invoiceNo,
      terminal: inStoreSPTerminal
    };
    console.log(requestBody);
    const invoiceQrData = await socialPayInvoiceQR(requestBody, config);
    const qrText =
      invoiceQrData.body &&
      invoiceQrData.body.response &&
      invoiceQrData.body.response.desc
        ? invoiceQrData.body.response.desc
        : '';

    if (qrText) {
      await models.SocialPayInvoice.socialPayInvoiceUpdate(
        models,
        invoiceLog,
        qrText
      );
    }

    return invoiceQrData;
  },
  /**
   * create socialPay invoice with phone
   */

  createSPInvoicePhone: async (_root, params, { subdomain, models }) => {
    const { amount, phone } = params;
    const config = await getConfig(subdomain, 'SocialPAY', {});
    const { inStoreSPTerminal, inStoreSPKey } = config;

    const invoiceNo = params.invoiceNoAuto
      ? await makeInvoiceNo(32)
      : params.invoice;

    const checksum = await hmac256(
      inStoreSPKey,
      inStoreSPTerminal + invoiceNo + amount + phone
    );
    const doc = { amount, invoiceNo, phone };
    await models.SocialPayInvoice.socialPayInvoiceCreate(models, doc);

    const requestBody = {
      amount,
      checksum,
      invoice: invoiceNo,
      phone,
      terminal: inStoreSPTerminal
    };

    return await socialPayInvoicePhone(requestBody, config);
  }
};

export default Mutations;
