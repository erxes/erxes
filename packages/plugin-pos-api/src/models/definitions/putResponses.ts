import { Document, Schema } from 'mongoose';
import { getDateFieldDefinition } from './utils';
import { field, schemaHooksWrapper } from './util';

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

export const putResponseSchema = schemaHooksWrapper(
  new Schema({
    _id: field({ pkey: true }),
    createdAt: getDateFieldDefinition('Created at'),
    modifiedAt: field({ type: Date, label: 'Modified at' }),

    contentType: field({ type: String, label: 'Content Type' }),
    contentId: field({ type: String, label: 'Pos order id' }),

    // Баримтыг бүртгэх процесс амжилттай болсон тухай илтгэнэ
    success: field({ type: String, label: 'Success status' }),

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
    lotteryWarningMsg: field({
      type: String,
      label: 'Lottery warning message'
    }),

    // Хэрэв алдаа илэрсэн бол уг алдааны код
    errorCode: field({ type: String, label: 'Error code' }),

    // Алдааны мэдээллийн текстэн утга
    message: field({ type: String, label: 'Error message' }),

    // billType == 1 and lottery is null or '' then save
    getInformation: field({ type: String, label: 'Other information' }),

    // Татварын төрөл
    taxType: field({ type: String }),

    // Баримтын баталгаажуулах Qr кодонд орох нууцлагдсан тоон утга түр санах
    qrData: field({ type: String }),

    // Сугалааны дугаар түр санах
    lottery: field({ type: String }),

    // Э-баримт руу илгээсэн мэдээлэfield(л)
    sendInfo: field({ type: Object, label: 'Ebarimt data' }),

    stocks: { type: Object, label: 'Ebarimt stocks' },
    // Мөнгөн дүнгүүд э-баримтаас string байдлаар ирдэг учраас тэр чигээр нь хадгалъя
    amount: field({ type: String, label: 'Amount' }),
    cityTax: field({ type: String, label: 'City tax amount' }),
    vat: field({ type: String, label: 'Vat amount' }),
    returnBillId: field({ type: String }),
    cashAmount: field({ type: String, label: 'Cash amount' }),
    nonCashAmount: field({ type: String, label: 'Non cash amount' }),
    registerNo: field({ type: String, label: 'Company register number' }),
    customerNo: field({ type: String }),
    customerName: field({ type: String }),
    synced: field({ type: Boolean, default: false, label: 'synced on erxes' })
  }),
  'erxes_putResponse'
);
