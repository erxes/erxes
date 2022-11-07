import { DISTRICTS } from './constants';
import { sendRequest } from '@erxes/api-utils/src';
import { IPutResponse } from './definitions/ebarimt';
import { IModels } from '../connectionResolver';

const format_number = (num: number) => {
  try {
    return num.toFixed(2);
  } catch (e) {
    return '0.00';
  }
};

export interface IPutDataArgs {
  date?: string;
  number?: string;
  orderId?: string;
  hasVat?: boolean;
  hasCitytax?: boolean;
  billType?: string;
  customerCode?: string;
  customerName?: string;
  productsById?: any;
  details?: any[];
  cashAmount?: number;
  nonCashAmount?: number;

  transaction?;
  records?;
  taxType?: string;
  returnBillId?: string;

  config: any;
  models: any;
  contentType: string;
  contentId: string;
}

export class PutData<IListArgs extends IPutDataArgs> {
  public districtCode!: string;
  public params: IListArgs;
  public transactionInfo: any;
  public models: any;
  public vatPercent!: number;
  public cityTaxPercent!: number;
  public defaultGScode!: string;
  public config: any;

  constructor(params: IListArgs) {
    this.params = params;
    this.models = params.models;
    this.config = params.config;
    this.districtCode = DISTRICTS[this.config.districtName] || '';
    this.vatPercent = Number(this.config.vatPercent) || 0;
    this.cityTaxPercent = Number(this.config.cityTaxPercent) || 0;
    this.defaultGScode = this.config.defaultGSCode || '';
  }

  public async run(): Promise<IPutResponse> {
    const url = this.config.ebarimtUrl || '';
    this.districtCode = DISTRICTS[this.config.districtName] || '';
    const rd = this.config.companyRD || '';

    const { contentType, contentId, number } = this.params;

    if (!this.districtCode) {
      throw new Error('Not validate District');
    }

    this.transactionInfo = await this.generateTransactionInfo();

    const prePutResponse = await this.models.PutResponses.putHistories({
      contentType,
      contentId
    });

    if (prePutResponse) {
      this.transactionInfo.returnBillId = prePutResponse.billId;
    }

    const resObj = await this.models.PutResponses.createPutResponse({
      sendInfo: { ...this.transactionInfo },
      contentId,
      contentType,
      number
    });

    const responseStr = await sendRequest({
      url: `${url}/put?lib=${rd}`,
      method: 'POST',
      body: { data: this.transactionInfo },
      params: { data: this.transactionInfo }
    });

    const response = JSON.parse(responseStr);

    if (
      response.billType === '1' &&
      response.lottery === '' &&
      response.success
    ) {
      if (prePutResponse) {
        response.lottery = prePutResponse.lottery;
      } else {
        response.getInformation = await sendRequest({
          url: `${url}/getInformation?lib=${rd}`,
          method: 'GET'
        });
      }
    }

    await this.models.PutResponses.updatePutResponse(resObj._id, {
      ...response,
      customerName: this.params.customerName
    });

    return this.models.PutResponses.findOne({ _id: resObj._id }).lean();
  }

  private async generateStock(detail, vat, citytax) {
    if (!detail.count) {
      return;
    }

    const product = this.params.productsById[detail.productId] || {};
    if (!product._id) {
      return;
    }

    return {
      code: detail.inventoryCode,
      barCode: this.defaultGScode,
      name: product.name,
      measureUnit: product.sku || 'ш',
      qty: format_number(detail.count),
      unitPrice: format_number(detail.amount / detail.count),
      totalAmount: format_number(detail.amount),
      vat: format_number(vat),
      cityTax: format_number(citytax),
      discount: format_number(detail.discount)
    };
  }

  private async generateStocks() {
    let sumAmount = 0;
    let vatAmount = 0;
    let citytaxAmount = 0;
    const stocks = [] as any;

    const taxPercent = this.vatPercent + this.cityTaxPercent;

    for (const detail of this.params.details || []) {
      sumAmount += detail.amount;

      const vat = (detail.amount / (100 + taxPercent)) * this.vatPercent;
      vatAmount += vat;

      const cityTax =
        (detail.amount / (100 + taxPercent)) * this.cityTaxPercent;
      citytaxAmount += cityTax;

      stocks.push(await this.generateStock(detail, vat, cityTax));
    }

    return { stocks, sumAmount, vatAmount, citytaxAmount };
  }

  public async generateTransactionInfo() {
    const {
      stocks,
      sumAmount,
      vatAmount,
      citytaxAmount
    } = await this.generateStocks();

    return {
      date: this.params.date,
      cashAmount: format_number(sumAmount),
      nonCashAmount: format_number(0),

      amount: format_number(sumAmount),
      vat: format_number(vatAmount),
      cityTax: format_number(citytaxAmount),

      districtCode: this.districtCode,
      billType: this.params.billType,
      taxType: this.params.taxType,

      stocks,

      customerNo: this.params.customerCode,

      // # Хэрвээ буцаах гэж байгаа бол түүний ДДД
      returnBillId: this.params.returnBillId
    };
  }
}

export const returnBill = async (models: IModels, doc, config) => {
  const url = config.ebarimtUrl || '';
  const { contentType, contentId } = doc;

  const prePutResponse = await models.PutResponses.putHistories({
    contentType,
    contentId
  });

  if (!prePutResponse) {
    return {
      error: 'Буцаалт гүйцэтгэх шаардлагагүй баримт байна.'
    };
  }

  const rd = prePutResponse.registerNo;
  const date = prePutResponse.date;

  if (!prePutResponse.billId || !rd || !date) {
    return {
      error: 'Буцаалт гүйцэтгэх шаардлагагүй баримт байна.'
    };
  }

  const data = {
    returnBillId: prePutResponse.billId,
    date: date
  };

  const resObj = await models.PutResponses.createPutResponse({
    sendInfo: { ...data },
    contentId,
    contentType,
    returnBillId: prePutResponse.billId
  });

  const responseStr = await sendRequest({
    url: `${url}/returnBill?lib=${rd}`,
    method: 'POST',
    body: { data },
    params: { ...data }
  });

  const response = JSON.parse(responseStr);
  await models.PutResponses.updatePutResponse(resObj._id, {
    ...response
  });

  return models.PutResponses.findOne({ _id: resObj._id }).lean();
};
