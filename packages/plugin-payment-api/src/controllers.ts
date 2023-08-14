import { getEnv, getSubdomain } from '@erxes/api-utils/src/core';
import { debugInfo } from '@erxes/api-utils/src/debuggers';
import { Router } from 'express';

import { generateModels } from './connectionResolver';
import redisUtils from './redisUtils';
import { PAYMENTS } from './api/constants';
import { StorePayAPI } from './api/storepay/api';
import { sendRequest } from '@erxes/api-utils/src';

const router = Router();

router.post('/checkInvoice', async (req, res) => {
  const { invoiceId } = req.body;

  const status = await redisUtils.getInvoiceStatus(invoiceId);

  if (status === 'paid') {
    const subdomain = getSubdomain(req);
    const models = await generateModels(subdomain);
    const invoice = await models.Invoices.getInvoice({ _id: invoiceId });

    redisUtils.removeInvoice(invoiceId);

    res.clearCookie(`paymentData_${invoice.contentTypeId}`);

    return res.json({ status: invoice.status });
  }

  return res.json({ status });
});

router.post('/gateway/manualCheck', async (req, res) => {
  const { invoiceId } = req.body;

  const subdomain = getSubdomain(req);
  const models = await generateModels(subdomain);

  const invoice = await models.Invoices.checkInvoice(invoiceId);

  return res.json({ status: invoice });
});

router.post('/gateway/storepay', async (req, res) => {
  const { selectedPaymentId, paymentKind, invoiceData, phone } = req.body;
  if (paymentKind !== 'storepay') {
    return res.json({ status: 'error' });
  }

  const subdomain = getSubdomain(req);
  const models = await generateModels(subdomain);

  const invoice = await models.Invoices.findOne({
    _id: invoiceData._id
  }).lean();
  if (!invoice) {
    return res.json({ status: 'error' });
  }
  if (invoice && invoice.status === 'paid') {
    return res.json({ status: invoice.status });
  }

  const DOMAIN = getEnv({ name: 'DOMAIN' })
    ? `${getEnv({ name: 'DOMAIN' })}/gateway`
    : 'http://localhost:4000';
  const domain = DOMAIN.replace('<subdomain>', subdomain);

  if (invoice && invoice.status !== 'paid' && invoice.phone !== phone) {
    await models.Invoices.updateOne({ _id: invoice._id }, { $set: { phone } });
  }

  const payment = await models.Payments.getPayment(selectedPaymentId);

  const api = new StorePayAPI(payment.config, domain);

  try {
    const apiRes = await api.createInvoice({ ...invoice, phone } as any);
    invoice.apiResponse = apiRes;

    await models.Invoices.updateOne(
      { _id: invoice._id },
      { $set: { apiResponse: apiRes } }
    );
    return res.json({ invoice: invoice.apiResponse });
  } catch (e) {
    return res.json({ error: e.message });
  }
});

router.post('/gateway/updateInvoice', async (req, res) => {
  const { selectedPaymentId, paymentKind, invoiceData, phone } = req.body;
  const subdomain = getSubdomain(req);
  const models = await generateModels(subdomain);

  let invoice = await models.Invoices.findOne({ _id: invoiceData._id });

  if (invoice && invoice.status === 'paid') {
    return res.json({ status: invoice.status });
  }

  const DOMAIN = getEnv({ name: 'DOMAIN' })
    ? `${getEnv({ name: 'DOMAIN' })}/gateway`
    : 'http://localhost:4000';
  const domain = DOMAIN.replace('<subdomain>', subdomain);

  if (
    invoice &&
    invoice.status !== 'paid' &&
    invoice.selectedPaymentId !== selectedPaymentId
  ) {
    await models.Invoices.updateInvoice(invoice._id, {
      selectedPaymentId,
      paymentKind,
      phone,
      domain
    });
  }

  if (!invoice) {
    invoice = await models.Invoices.createInvoice({
      ...invoiceData,
      selectedPaymentId,
      phone,
      domain
    });
  }

  if (paymentKind === 'storepay') {
    await models.Invoices.updateInvoice(invoice._id, {
      selectedPaymentId,
      paymentKind,
      phone,
      domain
    });
  }

  invoice = await models.Invoices.getInvoice({ _id: invoice._id });

  try {
    redisUtils.updateInvoiceStatus(invoice._id, 'pending');

    return res.json({ invoice });
  } catch (e) {
    return res.json({ error: e.message });
  }
});

router.get('/gateway', async (req, res) => {
  const { params } = req.query;

  const data = JSON.parse(
    Buffer.from(params as string, 'base64').toString('utf8')
  );

  const subdomain = getSubdomain(req);
  const models = await generateModels(subdomain);

  const filter: any = {};

  if (data.paymentIds) {
    filter._id = { $in: data.paymentIds };
  }

  const paymentsFound = await models.Payments.find(filter)
    .sort({
      type: 1
    })
    .lean();

  const payments = paymentsFound.map(p => ({
    _id: p._id,
    kind: p.kind,
    title: PAYMENTS[p.kind].title
  }));

  const invoice = await models.Invoices.findOne({ _id: data._id }).lean();

  const prefix = subdomain === 'localhost' ? '' : `/gateway`;

  debugInfo(`in gateway path-: subdomain: ${subdomain}, prefix: ${prefix}`);

  if (invoice && invoice.status === 'paid') {
    return res.render('index', {
      title: 'Payment gateway',
      payments,
      invoiceData: data,
      invoice,
      prefix
    });
  }

  const monpayCouponEnabled: boolean =
    process.env.MONPAY_COUPON_USERNAME && process.env.MONPAY_COUPON_PASSWORD
      ? true
      : false;

  res.render('index', {
    title: 'Payment gateway',
    payments,
    invoiceData: data,
    prefix: subdomain === 'localhost' ? '' : `/gateway`,
    monpayCouponEnabled
  });
});

router.post('/gateway', async (req, res, next) => {
  const { params } = req.query;

  const data = JSON.parse(
    Buffer.from(params as string, 'base64').toString('utf8')
  );

  const subdomain = getSubdomain(req);
  const models = await generateModels(subdomain);

  const prefix = subdomain === 'localhost' ? '' : `/gateway`;

  const filter: any = {};

  if (data.paymentIds) {
    filter._id = { $in: data.paymentIds };
  }

  const paymentsFound = await models.Payments.find(filter)
    .sort({
      type: 1
    })
    .lean();

  const payments = paymentsFound.map(p => ({
    ...p,
    title: PAYMENTS[p.kind].title
  }));

  const selectedPaymentId = req.body.selectedPaymentId;
  let selectedPayment: any = null;

  const paymentsModified = payments.map(p => {
    if (p._id === selectedPaymentId) {
      selectedPayment = p;
      return {
        ...p,
        selected: true
      };
    }

    return p;
  });

  let invoice = await models.Invoices.findOne({ _id: data._id });

  if (req.body.phone && invoice) {
    data.phone = req.body.phone;
    invoice.phone = req.body.phone;
  }

  if (
    !data.phone &&
    invoice &&
    invoice.status === 'pending' &&
    selectedPayment.kind === PAYMENTS.storepay.kind
  ) {
    res.render('index', {
      title: 'Payment gateway',
      payments: paymentsModified,
      invoiceData: data,
      invoice: {
        ...invoice,
        selectedPaymentId,
        paymentKind: PAYMENTS.storepay.kind,
        apiResponse: {
          error: 'Enter your Storepay registered phone number',
          errorType: 'phoneRequired'
        }
      },
      error: 'Enter your Storepay registered phone number',
      prefix
    });

    return;
  }

  if (invoice && invoice.status === 'paid') {
    return res.render('index', {
      title: 'Payment gateway',
      payments: paymentsModified,
      invoiceData: data,
      invoice,
      prefix
    });
  }

  const DOMAIN = getEnv({ name: 'DOMAIN' })
    ? `${getEnv({ name: 'DOMAIN' })}/gateway`
    : 'http://localhost:4000';
  const domain = DOMAIN.replace('<subdomain>', subdomain);

  if (
    invoice &&
    invoice.status !== 'paid' &&
    invoice.selectedPaymentId !== selectedPaymentId
  ) {
    await models.Invoices.updateInvoice(invoice._id, {
      selectedPaymentId,
      ...data,
      paymentKind: selectedPayment.kind,
      domain
    });

    invoice = await models.Invoices.findOne({ _id: data._id });
  }

  if (!invoice) {
    invoice = await models.Invoices.createInvoice({
      ...data,
      selectedPaymentId,
      domain
    });
  }

  try {
    redisUtils.updateInvoiceStatus(invoice._id, 'pending');

    res.render('index', {
      title: 'Payment gateway',
      payments: paymentsModified,
      invoiceData: data,
      invoice,
      prefix
    });
  } catch (e) {
    res.render('index', {
      title: 'Payment gateway',
      payments: paymentsModified,
      invoiceData: data,
      error: e.message,
      prefix
    });
  }
});

router.post('/gateway/monpay/coupon', async (req, res, next) => {
  const { invoiceData, couponCode } = req.body;

  const subdomain = getSubdomain(req);
  const models = await generateModels(subdomain);

  // login to monpay and get token
  const username = process.env.MONPAY_COUPON_USERNAME;
  const password = process.env.MONPAY_COUPON_PASSWORD;

  const loginResponse = await sendRequest({
    url: `${PAYMENTS.monpay.apiUrl}/rest/branch/login`,
    method: 'POST',
    body: {
      username,
      password
    },

    headers: {
      'Content-Type': 'application/json'
    }
  });

  if (loginResponse.code !== 0) {
    return res.status(400).json({
      message: 'Invalid credentials'
    });
  }

  const token = loginResponse.result.token;

  try {
    const couponResponse = await sendRequest({
      url: `${PAYMENTS.monpay.apiUrl}/rest/branch/coupon/scan`,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      params: {
        couponCode
      }
    });

    if (couponResponse.code !== 0) {
      return res.status(400).json({
        message: 'Invalid coupon code'
      });
    }

    if (!couponResponse.result.isUsable) {
      return res.status(400).json({
        message: 'Coupon is not usable'
      });
    }

    const invoice = await models.Invoices.findOne({
      _id: invoiceData._id
    }).lean();

    if (!invoice) {
      return res.status(400).json({
        message: 'Invoice not found'
      });
    }

    if (invoice.status === 'paid') {
      return res.status(400).json({
        message: 'Invoice already paid'
      });
    }

    await models.Invoices.updateOne(
      { _id: invoice._id },
      { $set: { couponCode, couponAmount: couponResponse.result.couponAmount } }
    );

    return res.json({
      invoice: await models.Invoices.findOne({ _id: invoice._id })
    });
  } catch (e) {
    return res.status(400).json({
      message: 'Invalid coupon code'
    });
  }
});

export default router;
