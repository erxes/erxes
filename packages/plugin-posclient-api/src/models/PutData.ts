import fetch from 'node-fetch';
import * as moment from 'moment';
import { IEbarimt } from './definitions/putResponses';
import { BILL_TYPES } from './definitions/constants';
import { IEbarimtConfig } from './definitions/configs';

export interface IDoc {
  contentType: string;
  contentId: string;
  number: string;

  date?: Date;
  type: string;

  customerRD?: string;
  customerTin?: string;
  customerName?: string;
  consumerNo?: string;

  details?: {
    product: {
      _id: string;
      name: string;
      shortName?: string;
      categoryId?: string;
      type?: string;
      barcodes?: string[];
      unitPrice?: number;
      code: string;
      status?: string;
      uom?: string;
      taxType?: string;
      taxCode?: string;
    };
    barcode?: string;
    quantity: number;
    unitPrice: number;
    totalDiscount: number;
    totalAmount: number;
  }[];
  nonCashAmounts: { amount: number }[];

  inactiveId?: string;
  invoiceId?: string;
}

export interface IPutDataArgs {
  config: IEbarimtConfig;
  doc: IDoc
}

export const isValidBarcode = (barcode: string): boolean => {
  // check length
  if (
    barcode.length < 8 ||
    barcode.length > 18 ||
    (barcode.length != 8 &&
      barcode.length != 12 &&
      barcode.length != 13 &&
      barcode.length != 14 &&
      barcode.length != 18)
  ) {
    return false;
  }

  const lastDigit = Number(barcode.substring(barcode.length - 1));
  let checkSum = 0;
  if (isNaN(lastDigit)) {
    return false;
  } // not a valid upc/ean

  const arr: any = barcode
    .substring(0, barcode.length - 1)
    .split('')
    .reverse();
  let oddTotal = 0,
    evenTotal = 0;

  for (var i = 0; i < arr.length; i++) {
    if (isNaN(arr[i])) {
      return false;
    } // can't be a valid upc/ean we're checking for

    if (i % 2 == 0) {
      oddTotal += Number(arr[i]) * 3;
    } else {
      evenTotal += Number(arr[i]);
    }
  }
  checkSum = (10 - ((evenTotal + oddTotal) % 10)) % 10;

  // true if they are equal
  return checkSum == lastDigit;
};

export const getEbarimtData = async (params: IPutDataArgs) => {
  const { config, doc } = params;
  const type = doc.type || BILL_TYPES.CITIZEN;
  let customerTin;
  let consumerNo;

  if (type === 'B2B_RECEIPT') {
    const resp = await getCompanyInfo({ getTinUrl: config.getTinUrl, getInfoUrl: config.getInfoUrl, tin: doc.customerTin || '', rd: doc.customerRD });
    if (resp.status === 'checked') {
      customerTin = resp.tin;
    } else {
      return { status: 'err', msg: 'wrong tin number or rd or billType' }
    }
  } else {
    if (doc.consumerNo && new RegExp('^[0-9]{8}$', 'gui').test(doc.consumerNo)) {
      consumerNo = doc.consumerNo;
    }
  }

  let reportMonth: string | undefined = undefined;
  if (doc.date && doc.date.getMonth() !== (new Date()).getMonth()) {
    reportMonth = moment(doc.date).format('YYYY-MM-DD')
  }

  const details: any[] = [];
  const detailsFree: any[] = [];
  const details0: any[] = [];
  const detailsInner: any[] = [];
  let ableAmount = 0;
  let freeAmount = 0;
  let zeroAmount = 0;
  let innerAmount = 0;
  let ableVATAmount = 0;
  let ableCityTaxAmount = 0;

  const vatPercent =
    (config.hasVat && Number(config.vatPercent)) || 0;
  const cityTaxPercent =
    (config.hasCitytax && Number(config.cityTaxPercent)) || 0;
  const totalPercent = vatPercent + cityTaxPercent + 100

  for (const detail of doc.details || []) {
    const product = detail.product;

    // if wrong productId then not sent
    if (!product) {
      continue;
    }

    const barCode = detail.barcode || (product.barcodes || [])[0];
    const barCodeType = isValidBarcode(barCode) ? 'GS1' : 'UNDEFINED'

    const stock = {
      name: product.shortName ? product.shortName : `${product.code} - ${product.name}`,
      barCode,
      barCodeType,
      classificationCode: config.defaultGSCode,
      taxProductCode: product.taxCode,
      measureUnit: product.uom || 'ш',
      qty: detail.quantity,
      unitPrice: detail.unitPrice,
      totalBonus: detail.totalDiscount,
      totalAmount: detail.totalAmount,
      totalVAT: 0,
      totalCityTax: 0,
      data: {},
      productId: product._id,
    };

    if (product.taxType === '2') {
      detailsFree.push({ ...stock });
      freeAmount += detail.totalAmount;
    } else if (product.taxType === '3' && type === 'B2B_RECEIPT') {
      details0.push({ ...stock });
      zeroAmount += detail.totalAmount;
    } else if (product.taxType === '5') {
      detailsInner.push({ ...stock });
      innerAmount += detail.totalAmount;
    } else {
      const totalVAT = detail.totalAmount / totalPercent * vatPercent;
      const totalCityTax = detail.totalAmount / totalPercent * cityTaxPercent;
      ableAmount += detail.totalAmount;
      ableVATAmount += totalVAT;
      ableCityTaxAmount += totalCityTax;

      details.push({ ...stock, totalVAT, totalCityTax });
    }
  }

  const mainData: IEbarimt = {
    number: doc.number,
    contentType: doc.contentType,
    contentId: doc.contentId,

    totalAmount: ableAmount + freeAmount + zeroAmount + innerAmount,
    totalVAT: ableVATAmount,
    totalCityTax: ableCityTaxAmount,
    districtCode: config.districtCode,
    branchNo: config.branchNo,
    merchantTin: config.merchantTin,
    posNo: config.posNo,
    type: doc.type,
    reportMonth,
    data: {},
    customerTin,
    consumerNo,

    receipts: [],
    payments: []
  };

  const commonOderInfo = {
    merchantTin: config.merchantTin,
    totalVAT: 0,
    totalCityTax: 0,
    data: {},
  }

  if (detailsFree && detailsFree.length) {
    mainData.receipts?.push({
      ...commonOderInfo,
      totalAmount: freeAmount,
      taxType: 'VAT_FREE',
      items: detailsFree,
    });
  }

  if (details0 && details0.length) {
    mainData.receipts?.push({
      ...commonOderInfo,
      totalAmount: zeroAmount,
      taxType: 'VAT_ZERO',
      items: details0,
    });
  }

  if (detailsInner && detailsInner.length) {
    mainData.receipts?.push({
      ...commonOderInfo,
      // inner: true, // TODO: check
      totalAmount: innerAmount,
      taxType: 'NO_VAT',
      items: detailsInner,
    });
  }

  if (details && details.length) {
    mainData.receipts?.push({
      ...commonOderInfo,
      totalAmount: ableAmount,
      totalVAT: ableVATAmount,
      totalCityTax: ableCityTaxAmount,
      taxType: 'VAT_ABLE',
      items: details,
    });
  }

  // payments
  let cashAmount = mainData.totalAmount || 0;
  for (const payment of doc.nonCashAmounts) {
    mainData.payments?.push({
      code: 'PAYMENT_CARD',
      exchangeCode: '',
      status: 'PAID',
      paidAmount: payment.amount,
    });

    cashAmount -= payment.amount;
  }

  if (cashAmount) {
    mainData.payments?.push({
      code: 'CASH',
      exchangeCode: '',
      status: 'PAID',
      paidAmount: cashAmount,
    });
  }

  return { status: 'ok', data: mainData };
}

export const getCompanyInfo = async ({ getTinUrl, getInfoUrl, tin, rd }: { getTinUrl: string, getInfoUrl: string, tin?: string, rd?: string }) => {
  const tinre = new RegExp('(^[0-9]{11}$)|(^[0-9]{14}$)', 'gui');
  if (tin && tinre.test(tin)) {
    const result = await fetch(
      // `https://api.ebarimt.mn/api/info/check/getInfo?tin=${tinNo}`
      `${getInfoUrl}?tin=${tin}`
    ).then((r) => r.json());

    return { status: 'checked', result, tin };
  }

  const re = new RegExp('(^[А-ЯЁӨҮ]{2}[0-9]{8}$)|(^\\d{7}$)', 'gui');

  if (!rd || !re.test(rd)) {
    return { status: 'notValid' };
  }

  const info = await fetch(
    // `https://api.ebarimt.mn/api/info/check/getTinInfo?regNo=${rd}`
    `${getTinUrl}?regNo=${rd}`
  ).then((r) => r.json());

  if (info.status !== 200) {
    return { status: 'notValid' };
  }

  const tinNo = info.data;

  const result = await fetch(
    // `https://api.ebarimt.mn/api/info/check/getInfo?tin=${tinNo}`
    `${getInfoUrl}?tin=${tinNo}`
  ).then((r) => r.json());

  return { status: 'checked', result, tin: tinNo };
};
