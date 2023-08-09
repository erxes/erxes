import { DISTRICTS } from './definitions/constants';
import { IModels } from '../connectionResolver';
import { sendRequest } from '@erxes/api-utils/src/requests';

const formatNumber = (num: number): string => {
  return num && num.toFixed ? num.toFixed(2) : '0.00';
};

export interface IPutDataArgs {
  models: IModels;
  number?: string;
  date?: string;
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

  transaction?: any;
  records?: any;
  taxType?: string;
  returnBillId?: string;

  config?: any;
  contentType: string;
  contentId: string;
}

interface IStockItem {
  code: string;
  name: string;
  measureUnit: string;
  qty: string;
  unitPrice: string;
  totalAmount: string;
  vat: string;
  cityTax: string;
  discount: string;
}

export class PutData<IListArgs extends IPutDataArgs> {
  public districtCode: string = '';
  public params: IListArgs;
  public transactionInfo: any;
  public vatPercent: number = 10;
  public cityTaxPercent: number = 0;
  public config: any;
  public models: IModels;
  public defaultGScode!: string;

  constructor(params: IListArgs) {
    this.params = params;
    this.config = params.config;
    this.models = params.models;

    this.vatPercent =
      (this.params.hasVat && Number(this.config.vatPercent)) || 0;
    this.cityTaxPercent =
      (this.params.hasCitytax && Number(this.config.cityTaxPercent)) || 0;
    this.defaultGScode = this.config.defaultGSCode || '';
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
      barCode: detail.barcode || this.defaultGScode,
      name: product.name,
      measureUnit: product.uom || 'ш',
      qty: formatNumber(detail.count),
      unitPrice: formatNumber(detail.amount / (detail.count || 1)),
      totalAmount: formatNumber(detail.amount),
      vat: formatNumber(vat),
      cityTax: formatNumber(citytax),
      discount: formatNumber(detail.discount || 0)
    };
  }

  private async generateStocks() {
    let sumAmount = 0;
    let vatAmount = 0;
    let citytaxAmount = 0;
    const stocks: IStockItem[] = [];

    const taxPercent = this.vatPercent + this.cityTaxPercent;

    for (const detail of this.params.details || []) {
      sumAmount += detail.amount;

      const vat = (detail.amount / (100 + taxPercent)) * this.vatPercent;
      vatAmount += vat;

      const cityTax =
        (detail.amount / (100 + taxPercent)) * this.cityTaxPercent;
      citytaxAmount += cityTax;

      const stock = await this.generateStock(detail, vat, cityTax);

      if (stock) {
        stocks.push(stock);
      }
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
      cashAmount: formatNumber(sumAmount),
      nonCashAmount: formatNumber(0),

      amount: formatNumber(sumAmount),
      vat: formatNumber(vatAmount),
      cityTax: formatNumber(citytaxAmount),

      districtCode: this.config.districtCode,
      billType: this.params.billType,
      taxType: this.params.taxType,

      stocks,

      customerNo: this.params.customerCode,
      billIdSuffix: Math.round(
        Math.random() * (999999 - 100000) + 100000
      ).toString(),

      // Хэрвээ буцаах гэж байгаа бол түүний ДДТД
      returnBillId: this.params.returnBillId
    };
  }

  public async run() {
    const url = this.config.ebarimtUrl || '';
    const rd = this.config.companyRD || '';

    const { contentType, contentId, number } = this.params;

    if (!Object.keys(DISTRICTS).includes(this.config.districtCode)) {
      throw new Error(`Invalid district code: ${this.config.districtCode}`);
    }

    this.transactionInfo = await this.generateTransactionInfo();

    const prePutResponse = await this.models.PutResponses.putHistory({
      contentType,
      contentId,
      taxType: this.params.taxType || ''
    });

    if (prePutResponse) {
      if (
        prePutResponse.amount === this.transactionInfo.amount &&
        prePutResponse.stocks &&
        prePutResponse.stocks.length === this.transactionInfo.stocks.length &&
        (prePutResponse.taxType || '1') ===
          (this.transactionInfo.taxType || '1') &&
        (prePutResponse.billType || '1') ===
          (this.transactionInfo.billType || '1')
      ) {
        return this.models.PutResponses.findOne({
          billId: prePutResponse.billId
        }).lean() as any;
      }

      this.transactionInfo.returnBillId = prePutResponse.billId;
      await this.models.PutResponses.updateOne(
        { _id: prePutResponse._id },
        { $set: { status: 'inactive' } }
      );
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
      response.billType == '1' &&
      response.lottery == '' &&
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
}

export const returnBill = async (models: IModels, doc, config) => {
  const url = config.ebarimtUrl || '';
  const { contentType, contentId } = doc;

  const prePutResponses = await models.PutResponses.putHistories({
    contentType,
    contentId
  });

  if (!prePutResponses.length) {
    return {
      error: 'Буцаалт гүйцэтгэх шаардлагагүй баримт байна.'
    };
  }

  const resultObjIds: string[] = [];
  for (const prePutResponse of prePutResponses) {
    const rd = prePutResponse.registerNo;
    const date = prePutResponse.date;

    if (!prePutResponse.billId || !rd || !date) {
      continue;
    }

    const data = {
      returnBillId: prePutResponse.billId,
      date: date
    };

    await models.PutResponses.updateOne(
      { _id: prePutResponse._id },
      { $set: { status: 'inactive' } }
    );

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
    resultObjIds.push(resObj._id);
  }

  return models.PutResponses.find({ _id: { $in: resultObjIds } })
    .sort({ createdAt: -1 })
    .lean();
};
