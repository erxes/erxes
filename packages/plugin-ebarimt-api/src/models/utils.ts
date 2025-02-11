import * as moment from 'moment';
import { IEbarimt, IEbarimtFull } from './definitions/ebarimt';
import { IEbarimtConfig } from './definitions/configs';
import { getCompanyInfo, mathRound } from '../utils';

export interface IDoc {
  contentType: string;
  contentId: string;
  number: string;

  date?: Date;
  type: 'B2C_RECEIPT' | 'B2B_RECEIPT';

  customerCode?: string;
  customerName?: string;
  customerTin?: string;
  consumerNo?: string;

  details?: {
    recId: string;
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
      citytaxCode?: string;
      citytaxPercent?: number;
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

const isValidBarcode = (barcode: string): boolean => {
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

  for (let i = 0; i < arr.length; i++) {
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

const getCustomerInfo = async (type: string, config: IEbarimtConfig, doc: IDoc) => {
  if (type === 'B2B_RECEIPT') {
    const tinre = /(^\d{11}$)|(^\d{12}$)|(^\d{14}$)/;
    if (tinre.test(doc.customerTin || '')) {
      return { customerTin: doc.customerTin, customerName: doc.customerName }
    }

    const resp = await getCompanyInfo({
      checkTaxpayerUrl: config.checkTaxpayerUrl,
      no: doc.customerTin || doc.customerCode || '',
    });

    if (resp.status !== 'checked' || !resp.tin) {
      return { msg: 'wrong tin number or rd or billType' }
    }
    return { customerTin: resp.tin, customerName: resp.result?.data?.name }
  }

  const re = /^\d{8}$/;
  if (doc.consumerNo && re.test(doc.consumerNo)) {
    return { consumerNo: doc.consumerNo, customerName: doc.customerName };
  }
  return { customerName: doc.customerName }
}

const genStock = (detail, product, config) => {
  const barCode = detail.barcode || (product.barcodes || [])[0] || '';
  const barCodeType = isValidBarcode(barCode) ? 'GS1' : 'UNDEFINED'

  return {
    name: product.shortName || `${product.code} - ${product.name}`,
    barCode,
    barCodeType,
    classificationCode: config.defaultGSCode,
    taxProductCode: product.taxCode,
    measureUnit: product.uom ?? 'ш',
    qty: detail.quantity,
    unitPrice: detail.unitPrice,
    totalBonus: detail.totalDiscount,
    totalAmount: detail.totalAmount,
    totalVAT: 0,
    totalCityTax: 0,
    data: {},
    productId: product._id,
  };
}

const getArrangeProducts = async (config: IEbarimtConfig, doc: IDoc) => {
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

  const vatPercent = config.hasVat && Number(config.vatPercent) || 0;
  const cityTaxPercent = config.hasCitytax && Number(config.cityTaxPercent) || 0;
  const totalPercent = vatPercent + cityTaxPercent + 100

  for (const detail of (doc.details || []).filter(d => d.product)) {
    const { product } = detail;

    const stock = genStock(detail, product, config)

    if (product.taxType === '2') {
      detailsFree.push({ ...stock });
      freeAmount += detail.totalAmount;
      continue
    }
    if (product.taxType === '3') {
      details0.push({ ...stock });
      zeroAmount += detail.totalAmount;
      continue
    }
    if (product.taxType === '5') {
      detailsInner.push({ ...stock });
      innerAmount += detail.totalAmount;
      continue
    }

    if (!config.hasCitytax && config.reverseCtaxRules?.length && product.citytaxCode) {
      // when has a reverseCtitytax
      const pCtaxPercent = Number(product.citytaxPercent) || 0; // productCitytaxPercent per
      const pTotalPercent = vatPercent + pCtaxPercent + 100;

      const totalVAT = detail.totalAmount / pTotalPercent * vatPercent;
      const totalCityTax = detail.totalAmount / pTotalPercent * pCtaxPercent;
      ableAmount += detail.totalAmount;
      ableVATAmount += totalVAT;
      ableCityTaxAmount += totalCityTax;
      details.push({ ...stock, totalVAT, totalCityTax });
    } else {
      // when a main
      const totalVAT = detail.totalAmount / totalPercent * vatPercent;
      const totalCityTax = detail.totalAmount / totalPercent * cityTaxPercent;
      ableAmount += detail.totalAmount;
      ableVATAmount += totalVAT;
      ableCityTaxAmount += totalCityTax;
      details.push({ ...stock, totalVAT, totalCityTax });
    }
  }

  return {
    details,
    detailsFree,
    details0,
    detailsInner,
    ableAmount: mathRound(ableAmount, 4),
    freeAmount: mathRound(freeAmount, 4),
    zeroAmount: mathRound(zeroAmount, 4),
    innerAmount: mathRound(innerAmount, 4),
    ableVATAmount: mathRound(ableVATAmount, 4),
    ableCityTaxAmount: mathRound(ableCityTaxAmount, 4),
  }
}

export const getEbarimtData = async (params: IPutDataArgs) => {
  const { config, doc } = params;
  const type = doc.type || 'B2C_RECEIPT';

  const { customerTin, consumerNo, msg, customerName } = await getCustomerInfo(type, config, doc);
  if (msg) {
    return { status: 'err', msg }
  }

  let reportMonth: string | undefined = undefined;
  if (doc.date && doc.date.getMonth() !== (new Date()).getMonth()) {
    reportMonth = moment(doc.date).format('YYYY-MM-DD')
  }

  const {
    details,
    detailsFree,
    details0,
    detailsInner,
    ableAmount,
    freeAmount,
    zeroAmount,
    innerAmount,
    ableVATAmount,
    ableCityTaxAmount,
  } = await getArrangeProducts(config, doc)

  let innerData: IEbarimtFull | undefined = undefined;
  let mainData: IEbarimt | undefined = undefined;

  const commonOderInfo = {
    merchantTin: config.merchantTin,
    totalVAT: 0,
    totalCityTax: 0,
    data: {},
  }

  if (details.length || details0.length || detailsFree.length) {
    mainData = {
      number: doc.number,
      contentType: doc.contentType,
      contentId: doc.contentId,

      totalAmount: mathRound(ableAmount + freeAmount + zeroAmount, 4),
      totalVAT: mathRound(ableVATAmount),
      totalCityTax: mathRound(ableCityTaxAmount),
      districtCode: config.districtCode,
      branchNo: config.branchNo,
      merchantTin: config.merchantTin,
      posNo: config.posNo,
      type: doc.type,
      reportMonth,
      data: {},
      customerTin,
      customerName,
      consumerNo,

      receipts: [],
      payments: []
    };

    if (detailsFree.length) {
      mainData.receipts?.push({
        ...commonOderInfo,
        totalAmount: freeAmount,
        taxType: 'VAT_FREE',
        items: detailsFree,
      });
    }

    if (details0.length) {
      mainData.receipts?.push({
        ...commonOderInfo,
        totalAmount: zeroAmount,
        taxType: 'VAT_ZERO',
        items: details0,
      });
    }

    if (details.length) {
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
    let cashAmount: number = mathRound(mainData.totalAmount) ?? 0;
    for (const payment of doc.nonCashAmounts) {
      mainData.payments?.push({
        code: 'PAYMENT_CARD',
        exchangeCode: '',
        status: 'PAID',
        paidAmount: mathRound(payment.amount),
      });

      cashAmount -= mathRound(payment.amount);
    }

    if (mathRound(cashAmount)) {
      mainData.payments?.push({
        code: 'CASH',
        exchangeCode: '',
        status: 'PAID',
        paidAmount: mathRound(cashAmount),
      });
    }
  }

  if (detailsInner.length) {
    innerData = {
      _id: 'tempBill',
      id: 'tempBIll',
      date: moment(new Date).format('"yyyy-MM-DD HH:mm:ss'),
      createdAt: new Date,
      modifiedAt: new Date,
      status: 'SUCCESS',
      message: '',
      posId: 0,

      number: doc.number,
      contentType: doc.contentType,
      contentId: doc.contentId,

      totalAmount: innerAmount,
      totalVAT: 0,
      totalCityTax: 0,
      districtCode: config.districtCode,
      branchNo: config.branchNo,
      merchantTin: config.merchantTin,
      posNo: config.posNo,
      type: doc.type,
      reportMonth,
      data: {},
      customerTin,
      consumerNo,

      receipts: [{
        ...commonOderInfo,
        totalAmount: innerAmount,
        taxType: 'NOT_SEND',
        items: detailsInner,
      }],
      payments: [{
        code: 'CASH',
        exchangeCode: '',
        status: 'PAID',
        paidAmount: innerAmount,
      }]
    };
  }


  return { status: 'ok', data: mainData, innerData };
}
