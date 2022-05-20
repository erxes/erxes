import { Document, Schema } from 'mongoose';
import { IPutResponseModel } from '../PutResponses';
import { field, getDateFieldDefinition } from './utils';

export interface IPutResponse {
  contentType: string;
  contentId: string;
  success?: string;
  billId?: string;
  date?: string;
  macAddress?: string;
  internalCode?: string;
  billType?: string;
  lotteryWarningMsg?: string;
  errorCode?: string;
  message?: string;
  getInformation?: string;
  taxType?: string;
  qrData?: string;
  lottery?: string;
  sendInfo?: object;
  stocks?: object;
  amount?: string;
  vat?: string;
  cityTax?: string;
  returnBillId?: string;
  cashAmount?: string;
  nonCashAmount?: string;
  registerNo?: string;
  customerNo?: string;
  customerName?: string;
  synced?: boolean;
}

export interface IPutResponseDocument extends Document, IPutResponse {
  _id: string;
  createdAt: Date;
  modifiedAt: Date;
}

export const putResponseSchema = new Schema<
  IPutResponseDocument,
  IPutResponseModel
>({
  _id: field({ pkey: true }),
  createdAt: getDateFieldDefinition('Created at'),
  modifiedAt: { type: Date, label: 'Modified at' },

  contentType: { type: String, label: 'Content Type', default: 'pos' },
  contentId: { type: String, label: 'Pos order id' },

  // Баримтыг бүртгэх процесс амжилттай болсон тухай илтгэнэ
  success: { type: String, label: 'Success status' },

  // Баримтын ДДТД
  // 33 оронтой тоон утга / НӨАТ - ийн тухай хуулинд зааснаар/
  billId: { type: String, label: 'Bill ID', index: true },

  // Баримт хэвлэсэн огноо
  // Формат: yyyy - MM - dd hh: mm: ss
  date: { type: String, label: 'Date' },

  // Баримтыг хэвлэсэн бүртгэлийн машиний MacAddress
  macAddress: { type: String, label: 'macAddress' },

  // Баримтын дотоод код
  internalCode: { type: String, label: 'internal Code' },

  // Баримтын төрөл
  billType: { type: String, label: 'Bill Type' },

  // Сугалаа дуусаж буй эсвэл сугалаа хэвлэх боломжгүй болсон
  // талаар мэдээлэл өгөх утга
  lotteryWarningMsg: { type: String, label: 'Lottery warning message' },

  // Хэрэв алдаа илэрсэн бол уг алдааны код
  errorCode: { type: String, label: 'Error code' },

  // Алдааны мэдээллийн текстэн утга
  message: { type: String, label: 'Error message' },

  // billType == 1 and lottery is null or '' then save
  getInformation: { type: String, label: 'Other information' },

  // Татварын төрөл
  taxType: { type: String },

  // Баримтын баталгаажуулах Qr кодонд орох нууцлагдсан тоон утга түр санах
  qrData: { type: String },

  // Сугалааны дугаар түр санах
  lottery: { type: String },

  // Э-баримт руу илгээсэн мэдээлэл
  sendInfo: { type: Object, label: 'Ebarimt data' },

  stocks: { type: Object, label: 'Ebarimt stocks' },
  // Мөнгөн дүнгүүд э-баримтаас string байдлаар ирдэг учраас тэр чигээр нь хадгалъя
  amount: { type: String, label: 'Amount' },
  cityTax: { type: String, label: 'City tax amount' },
  vat: { type: String, label: 'Vat amount' },
  returnBillId: { type: String },
  cashAmount: { type: String, label: 'Cash amount' },
  nonCashAmount: { type: String, label: 'Non cash amount' },
  registerNo: { type: String, label: 'Company register number' },
  customerNo: { type: String },
  customerName: { type: String },
  synced: { type: Boolean, default: false, label: 'synced on erxes' }
});
