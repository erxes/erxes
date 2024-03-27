import { DISTRICTS } from './constants';
import { IModels } from '../connectionResolver';
import { IPutResponseDocument } from './definitions/ebarimt';
import fetch from 'node-fetch';

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
  details?: any[];
  cashAmount?: number;
  nonCashAmount?: number;

  taxType?: string;
  returnBillId?: string;

  config: any;
  models: IModels;
  contentType: string;
  contentId: string;
}

export class PutData<IListArgs extends IPutDataArgs> {
  public districtCode!: string;
  public params: IListArgs;
  public transactionInfo: any;
  public models: IModels;
  public vatPercent!: number;
  public cityTaxPercent!: number;
  public defaultGScode!: string;
  public config: any;

  constructor(params: IListArgs) {
    this.params = params;
    this.models = params.models;
    this.config = params.config;
    this.districtCode = DISTRICTS[this.config.districtName] || '';
    this.vatPercent =
      (this.params.hasVat && Number(this.config.vatPercent)) || 0;
    this.cityTaxPercent =
      (this.params.hasCitytax && Number(this.config.cityTaxPercent)) || 0;
    this.defaultGScode = this.config.defaultGSCode || '';
  }

  public async run(): Promise<IPutResponseDocument> {
    const url = this.config.ebarimtUrl || '';
    this.districtCode = DISTRICTS[this.config.districtName] || '';
    const rd = this.config.companyRD || '';

    const { contentType, contentId, number } = this.params;

    if (!this.districtCode) {
      throw new Error('Not validate District');
    }

    this.transactionInfo = await this.generateTransactionInfo();

    const continuePutResponses: IPutResponseDocument[] =
      await this.models.PutResponses.find({
        contentType,
        contentId,
        taxType: this.params.taxType,
        modifiedAt: { $exists: false }
      }).lean();

    if (continuePutResponses.length) {
      for (const cpr of continuePutResponses) {
        if ((new Date().getTime() - new Date(cpr.createdAt).getTime()) / 1000 < 10) {
          throw new Error('The previously submitted data has not yet been processed');
        }
      }
    }

    const prePutResponse: IPutResponseDocument | undefined =
      await this.models.PutResponses.putHistory({
        contentType,
        contentId,
        taxType: this.params.taxType || '',
      });

    if (prePutResponse) {
      // prePutResponse has not updated then not rePutData
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
          billId: prePutResponse.billId,
        }).lean() as any;
      }

      this.transactionInfo.returnBillId = prePutResponse.billId;
    }

    const resObj = await this.models.PutResponses.createPutResponse({
      sendInfo: { ...this.transactionInfo },
      contentId,
      contentType,
      taxType: this.params.taxType,
      number,
    });

    const response = await fetch(
      `${url}/put?` + new URLSearchParams({ lib: rd }),
      {
        method: 'POST',
        body: JSON.stringify({ data: this.transactionInfo }),
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000
      },
    )
      .then((r) => r.json())
      .catch((err) => {
        throw new Error(err.message);
      });

    if (
      response.billType === '1' &&
      response.lottery === '' &&
      response.success
    ) {
      if (prePutResponse) {
        response.lottery = prePutResponse.lottery;
      } else {
        response.getInformation = await fetch(
          `${url}/getInformation?lib=${rd}`,
        ).then((r) => r.text());
      }
    }

    if (prePutResponse && ['true', true].includes(response.success)) {
      await this.models.PutResponses.updateOne(
        { _id: prePutResponse._id },
        { $set: { status: 'inactive' } },
      );
    }

    await this.models.PutResponses.updatePutResponse(resObj._id, {
      ...response,
      customerName: this.params.customerName,
    });

    return this.models.PutResponses.findOne({ _id: resObj._id }).lean() as any;
  }

  private async generateStock(detail, vat, citytax) {
    if (!detail.count) {
      return;
    }

    return {
      code: detail.productCode,
      barCode: detail.barcode || this.defaultGScode,
      name: detail.productName,
      measureUnit: detail.uom || 'ш',
      qty: format_number(detail.count),
      unitPrice: format_number(detail.amount / detail.count),
      totalAmount: format_number(detail.amount),
      vat: format_number(vat),
      cityTax: format_number(citytax),
      discount: format_number(detail.discount),
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

      const stock = await this.generateStock(detail, vat, cityTax);

      if (stock) {
        stocks.push(stock);
      }
    }

    return { stocks, sumAmount, vatAmount, citytaxAmount };
  }

  public async generateTransactionInfo() {
    const { stocks, sumAmount, vatAmount, citytaxAmount } =
      await this.generateStocks();

    return {
      date: this.params.date,
      number: this.params.number,
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
      customerName: this.params.customerName,
      billIdSuffix: Math.round(
        Math.random() * (999999 - 100000) + 100000,
      ).toString(),

      // # Хэрвээ буцаах гэж байгаа бол түүний ДДД
      returnBillId: this.params.returnBillId,
    };
  }
}

export const returnBill = async (
  models: IModels,
  doc: { contentType: string; contentId: string; number: string },
  config: any,
) => {
  const url = config.ebarimtUrl || '';
  const { contentType, contentId } = doc;

  const prePutResponses = await models.PutResponses.putHistories({
    contentType,
    contentId,
  });

  if (!prePutResponses.length) {
    return {
      error: 'Буцаалт гүйцэтгэх шаардлагагүй баримт байна.',
    };
  }

  const resultObjIds: string[] = [];
  for (const prePutResponse of prePutResponses) {
    let rd = prePutResponse.registerNo;
    if (!rd) {
      continue;
    }

    if (rd.length === 12) {
      rd = rd.slice(-8);
    }

    const date = prePutResponse.date;

    if (!prePutResponse.billId || !date) {
      continue;
    }

    const data = {
      returnBillId: prePutResponse.billId,
      date: date,
    };

    const resObj = await models.PutResponses.createPutResponse({
      sendInfo: { ...data },
      contentId,
      contentType,
      number: doc.number,
      returnBillId: prePutResponse.billId,
    });

    const response = await fetch(`${url}/returnBill?lib=${rd}`, {
      method: 'POST',
      body: JSON.stringify({ data }),
      headers: {
        'Content-Type': 'application/json',
      },
    }).then((r) => r.json());

    if (['true', true].includes(response.success)) {
      await models.PutResponses.updateOne(
        { _id: prePutResponse._id },
        { $set: { status: 'inactive' } },
      );
    }

    await models.PutResponses.updatePutResponse(resObj._id, {
      ...response,
    });
    resultObjIds.push(resObj._id);
  }

  return models.PutResponses.find({ _id: { $in: resultObjIds } })
    .sort({ createdAt: -1 })
    .lean();
};
