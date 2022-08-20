import { Document, Schema } from 'mongoose';
import { field, schemaHooksWrapper } from './utils';

export interface IPutResponseConfig {
  ebarimtUrl: string;
  districtName: string;
  companyRD: string;
  vatPercent: string;
  cityTaxPercent: string;
  defaultGSCode: string;
}

export interface IPutResponse {
  date: Date;
  orderId: string;
  hasVat: boolean;
  hasCitytax: boolean;
  billType: string;
  customerCode: string;
  customerName: string;
  productsById: any;
  details: any[];
  cashAmount: number;
  nonCashAmount: number;

  transaction?;
  records?;
  taxType?: string;
  returnBillId?: string;

  contentType: string;
  contentId: string;
}

export interface IPutResponseDocument extends Document, IPutResponse {
  _id: string;
  createdAt: Date;
  modifiedAt: Date;
}

export const putResponseSchema = schemaHooksWrapper(
  new Schema({
    _id: field({ pkey: true }),
    createdAt: field({ type: Date, label: 'Created at' }),
    modifiedAt: field({ type: Date, label: 'Modified at' }),

    // Холбогдох обьект
    contentType: field({ type: String, label: 'Content Type' }),
    contentId: field({ type: String, label: 'Content' }),

    // Баримтыг бүртгэх процесс амжилттай болсон тухай илтгэнэ
    success: field({ type: String, label: 'success status' }),

    // Баримтын ДДТД
    // 33 оронтой тоон утга / НӨАТ - ийн тухай хуулинд зааснаар/
    billId: field({ type: String, label: 'Bill ID', index: true }),

    // Баримт хэвлэсэн огноо
    // Формат: yyyy - MM - dd hh: mm: ss
    date: field({ type: String, label: 'Date' }),

    // Баримтыг хэвлэсэн бүртгэлийн машиний MacAddress
    macAddress: field({ type: String, label: 'macAddress' }),

    // Баримтын дотоод код
    internalCode: field({ type: String, label: 'internal Code' }),

    // Баримтын төрөл
    billType: field({ type: String, label: 'Bill Type' }),

    // Сугалаа дуусаж буй эсвэл сугалаа хэвлэх боломжгүй болсон
    // талаар мэдээлэл өгөх утга
    lotteryWarningMsg: field({ type: String, label: '' }),

    // Хэрэв алдаа илэрсэн бол уг алдааны код
    errorCode: field({ type: String, label: '' }),

    // Алдааны мэдээллийн текстэн утга
    message: field({ type: String, label: '' }),

    // billType == 1 and lottery is null or '' then save
    getInformation: field({ type: String, label: '' }),

    // Татварын төрөл
    taxType: field({ type: String, label: '' }),

    // Баримтын баталгаажуулах Qr кодонд орох нууцлагдсан тоон утга түр санах
    qrData: field({ type: String, label: '' }),

    // Сугалааны дугаар түр санах
    lottery: field({ type: String, label: '' }),

    // Ебаримт руу илгээсэн мэдээлэл
    sendInfo: field({ type: Object, label: '' }),

    stocks: field({ type: Object, label: '' }),
    amount: field({ type: String, label: '' }),
    cityTax: field({ type: String, label: '' }),
    vat: field({ type: String, label: '' }),
    returnBillId: field({ type: String }),
    cashAmount: field({ type: String, label: '' }),
    nonCashAmount: field({ type: String, label: '' }),
    registerNo: field({ type: String, label: '' }),
    customerNo: field({ type: String, label: '' }),
    customerName: field({ type: String, label: '' }),

    posToken: field({ type: String, optional: true })
  }),

  'erxes_ebarimt'
);
