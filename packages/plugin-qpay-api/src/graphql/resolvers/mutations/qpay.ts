import {
  getConfig,
  qpayToken,
  makeInvoiceNo,
  createInvoice,
  getDataFromConfigById,
  deleteInvoice,
  deleteQpayPayment
} from '../../../utils';

import {
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
  },

  /**
   * START QPAY MUTATIONS
   */

  /**
   * create invoice
   */

  createQpayInvoice: async (_root, doc, { models, subdomain }) => {
    const config = await getConfig(subdomain, 'QPAY', {});
    const { qpayInvoiceCode } = config;
    let { callbackUrl } = config;

    const token = await qpayToken(config);

    const sender_invoice_no = !doc.sender_invoice_no_auto
      ? doc.sender_invoice_no
      : await makeInvoiceNo(16);

    callbackUrl = `${callbackUrl}?payment_id=${sender_invoice_no}`;

    const codeMap = {
      sender_branch_dataId: 'qpaySenderBranchDataCode',
      sender_staff_dataId: 'qpaySenderStaffDataCode',
      invoice_receiver_dataId: 'qpayInvoiceReceiverDataCode',
      lines: 'qpayLinesCode',
      transactions: 'qpayTransactionCode'
    };

    const sender_branch_code = doc.sender_branch_code || '';
    const sender_branch_dataId = doc.sender_branch_dataId
      ? (
          await getDataFromConfigById(
            codeMap['sender_branch_dataId'],
            [doc.sender_branch_dataId],
            config
          )
        )[0].data
      : '';
    const sender_staff_code = doc.sender_staff_code || '';
    const sender_staff_dataId = doc.sender_staff_dataId
      ? (
          await getDataFromConfigById(
            codeMap['sender_staff_dataId'],
            [doc.sender_branch_dataId],
            config
          )
        )[0].data
      : '';
    const sender_terminal_code = doc.sender_terminal_code || '';
    const sender_terminal_data = doc.sender_terminal_data
      ? { name: doc.sender_terminal_data }
      : '';
    const invoice_receiver_code = doc.invoice_receiver_code || '';
    const invoice_receiver_dataId = doc.invoice_receiver_dataId
      ? (
          await getDataFromConfigById(
            codeMap['invoice_receiver_dataId'],
            [doc.sender_branch_dataId],
            config
          )
        )[0].data
      : '';
    const invoice_description = doc.invoice_description || '';
    const invoice_due_date = doc.invoice_due_date || '';
    const enable_expiry = doc.enable_expiry || '';
    const expiry_date = doc.expiry_date || '';
    const calculate_vat = doc.calculate_vat || '';
    const tax_customer_code = doc.tax_customer_code || '';
    const line_tax_code = doc.line_tax_code || '';
    const allow_partial = doc.allow_partial || '';
    const minimum_amount = doc.minimum_amount || '';
    const allow_exceed = doc.allow_exceed || '';
    const maximum_amount = doc.maximum_amount || '';
    const amount = doc.amount || '';
    const note = doc.note || '';
    let lines = doc.lines
      ? await getDataFromConfigById(codeMap['lines'], doc.lines, config)
      : '';
    lines = lines ? lines.map(e => e.data) : '';
    let transactions = doc.transactions
      ? await getDataFromConfigById(
          codeMap['transactions'],
          doc.transactions,
          config
        )
      : '';
    transactions = transactions ? transactions.map(e => e.data) : '';

    const invoiceDoc = {
      senderInvoiceNo: sender_invoice_no,
      amount
    };

    const invoice = await models.QpayInvoice.qpayInvoiceCreate(invoiceDoc);
    let varData;
    const fillVarData = (obj, key, data) => {
      if (data) {
        return {
          ...obj,
          ...{ [key]: data }
        };
      } else {
        return obj;
      }
    };

    varData = fillVarData({}, 'invoice_code', qpayInvoiceCode);
    varData = fillVarData(varData, 'sender_invoice_no', sender_invoice_no);
    varData = fillVarData(varData, 'callback_url', callbackUrl);
    varData = fillVarData(varData, 'sender_branch_code', sender_branch_code);
    varData = fillVarData(
      varData,
      'sender_branch_dataId',
      sender_branch_dataId
    );
    varData = fillVarData(varData, 'sender_staff_code', sender_staff_code);
    varData = fillVarData(varData, 'sender_staff_dataId', sender_staff_dataId);
    varData = fillVarData(
      varData,
      'sender_terminal_code',
      sender_terminal_code
    );
    varData = fillVarData(
      varData,
      'sender_terminal_data',
      sender_terminal_data
    );
    varData = fillVarData(
      varData,
      'invoice_receiver_code',
      invoice_receiver_code
    );
    varData = fillVarData(
      varData,
      'invoice_receiver_dataId',
      invoice_receiver_dataId
    );
    varData = fillVarData(varData, 'invoice_description', invoice_description);
    varData = fillVarData(varData, 'invoice_due_date', invoice_due_date);
    varData = fillVarData(varData, 'enable_expiry', enable_expiry);
    varData = fillVarData(varData, 'expiry_date', expiry_date);
    varData = fillVarData(varData, 'calculate_vat', calculate_vat);
    varData = fillVarData(varData, 'tax_customer_code', tax_customer_code);
    varData = fillVarData(varData, 'line_tax_code', line_tax_code);
    varData = fillVarData(varData, 'allow_partial', allow_partial);
    varData = fillVarData(varData, 'minimum_amount', minimum_amount);
    varData = fillVarData(varData, 'allow_exceed', allow_exceed);
    varData = fillVarData(varData, 'maximum_amount', maximum_amount);
    varData = fillVarData(varData, 'amount', amount);
    varData = fillVarData(varData, 'note', note);
    varData = fillVarData(varData, 'lines', lines);
    varData = fillVarData(varData, 'transactions', transactions);
    const invoiceData = await createInvoice(varData, token, config);
    await models.QpayInvoice.qpayInvoiceUpdate(invoice, invoiceData);

    return invoiceData;
  },

  /**
   * create simple invoice
   */

  createQpaySimpleInvoice: async (_root, doc, { subdomain, models }) => {
    const config = await getConfig(subdomain, 'QPAY', {});

    const { qpayInvoiceCode, callbackUrl } = config;
    const token = await qpayToken(config);

    const {
      sender_invoice_no_auto,
      invoice_receiver_code,
      invoice_description,
      amount
    } = doc;
    const sender_invoice_no = !sender_invoice_no_auto
      ? doc.sender_invoice_no
      : await makeInvoiceNo(16);

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
      callback_url: `${callbackUrl}?payment_id=${sender_invoice_no}`
    };

    const invoiceData = await createInvoice(varData, token, config);

    await models.QpayInvoice.qpayInvoiceUpdate(invoice, invoiceData);

    return invoiceData;
  },

  cancelQpayInvoice: async (_root, params, { subdomain }) => {
    const config = await getConfig(subdomain, 'QPAY', {});
    const token = await qpayToken(config);

    return await deleteInvoice(params.invoiceId, token, config);
  },

  deleteQpayPayment: async (_root, params, { subdomain }) => {
    const config = await getConfig(subdomain, 'QPAY', {});
    const token = await qpayToken(config);

    return await deleteQpayPayment(
      params.paymentId,
      params.description || '',
      token,
      config
    );
  }
};

export default Mutations;
