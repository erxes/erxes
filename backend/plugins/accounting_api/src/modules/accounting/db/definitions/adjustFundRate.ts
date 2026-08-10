import { Schema } from 'mongoose';
import { mongooseStringRandomId } from 'erxes-api-shared/utils';

export const adjustFundRateDetailsSchema = new Schema({
  _id: mongooseStringRandomId,

  accountId: { type: String, label: 'Account' },
  mainBalance: { type: Number, label: 'Main Currency Balance' }, // Төгрөгийн буюу үндсэн валютын үлдэгдэл
  currencyBalance: { type: Number, label: 'Currency Balance' }, // Гадаад валютын үлдэгдэл
  transactionId: { type: String, optional: true, label: 'Transaction' }, // Хадгалах үед зөрүү дүнтэй бол TR үүснэ
  branchId: { type: String, optional: true, label: 'Branch' },
  departmentId: { type: String, optional: true, label: 'Department' },

  createdAt: { type: Date, default: Date.now, label: 'Created at' },
  updatedAt: { type: Date, optional: true, label: 'Modified at' },
});

export const adjustFundRatesSchema = new Schema({
  _id: mongooseStringRandomId,
  date: { type: Date, label: 'date' }, // хэднээр ханш тэгшитгэж байна вэ? буюу хүртэлх огноо *
  mainCurrency: { type: String, label: 'main currency' }, // үндсэн валют
  currency: { type: String, label: 'currency' }, // тэгшитгэх валют *
  description: { type: String, optional: true, label: 'description' }, // *
  spotRate: { type: Number, label: 'Spot Rate' }, // Тэгшитгэлийн ханш, спот ханш дуудна, засч болно

  gainAccountId: { type: String, label: 'Gain Account' }, // олз данс // *
  lossAccountId: { type: String, label: 'Loss Account' }, // гарз данс // *
  transactionId: { type: String, optional: true, label: 'Transaction' }, // детайл бүрийн зөрүүнийдийн нийлбэр 0ээс ялгаатай бол баримт үүснэ
  status: { type: String, default: 'draft', label: 'Status' },
  beginDate: { type: Date, optional: true, label: 'Begin date' },
  successDate: { type: Date, optional: true, label: 'Success date' },
  checkedAt: { type: Date, optional: true, label: 'Checked at' },
  error: { type: String, optional: true, label: 'Error' },
  warning: { type: String, optional: true, label: 'Warning' },

  details: {
    type: [adjustFundRateDetailsSchema],
    optional: true,
    label: 'description',
  }, // Төгрөгийн эсвэл валютын үлдэгдэлтэй дансдад харгалзаж үүснэ

  createdBy: { type: String, label: 'Created user' },
  modifiedBy: { type: String, optional: true, label: 'Modified user' },
  createdAt: { type: Date, default: Date.now, label: 'Created at' }, // үүссэн огноо
  updatedAt: { type: Date, optional: true, label: 'Modified at' }, // хамгийн сүүлд өөрчилсөн огноо
});
