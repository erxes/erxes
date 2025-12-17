import { Schema } from 'mongoose';
import { mongooseStringRandomId, schemaWrapper } from 'erxes-api-shared/utils';

export const adjustFundRateDetailsSchema = schemaWrapper(
  new Schema({
    _id: mongooseStringRandomId,

    accountId: { type: String, label: 'Account' },
    mainBalance: { type: Number, label: 'Main Currency Balance' }, // Төгрөгийн буюу үндсэн валютын үлдэгдэл
    currencyBalance: { type: Number, label: 'Currency Balance' }, // Гадаад валютын үлдэгдэл
    transactionId: { type: String, optional: true, label: 'Transaction' }, // Хадгалах үед зөрүү дүнтэй бол TR үүснэ

    createdAt: { type: Date, default: new Date(), label: 'Created at' },
    updatedAt: { type: Date, optional: true, label: 'Modified at' },
  }),
);

export const adjustFundRatesSchema = schemaWrapper(
  new Schema({
    _id: mongooseStringRandomId,
    date: { type: Date, label: 'date' }, // хэднээр ханш тэгшитгэж байна вэ? буюу хүртэлх огноо
    mainCurrency: { type: String, label: 'main currency' }, // үндсэн валют
    currency: { type: String, label: 'currency' }, // тэгшитгэх валют
    description: { type: String, optional: true, label: 'description' },
    spotRate: { type: Number, label: 'Spot Rate' }, // Тэгшитгэлийн ханш, спот ханш дуудна, засч болно

    gainAccountId: { type: String, label: 'Gain Account' }, // олз данс
    lossAccountId: { type: String, label: 'Loss Account' }, // гарз данс
    transactionId: { type: String, optional: true, label: 'Transaction' }, // детайл бүрийн зөрүүнийдийн нийлбэр 0ээс ялгаатай бол баримт үүснэ

    details: {
      type: [adjustFundRateDetailsSchema],
      optional: true,
      label: 'description',
    }, // Төгрөгийн эсвэл валютын үлдэгдэлтэй дансдад харгалзаж үүснэ

    branchId: { type: String, optional: true, label: 'Branch' }, // салбар сонгож болно. Сонгосон бол баримтууд уг салбараар, сонгоогүй бол дансныхаараа
    departmentId: { type: String, optional: true, label: 'Department' }, // хэлтэс сонгож болно. Сонгосон бол баримтууд уг хэлтэсээр, сонгоогүй бол дансныхаараа
    createdBy: { type: String, label: 'Created user' },
    modifiedBy: { type: String, optional: true, label: 'Modified user' },
    createdAt: { type: Date, default: new Date(), label: 'Created at' }, // үүссэн огноо
    updatedAt: { type: Date, optional: true, label: 'Modified at' }, // хамгийн сүүлд өөрчилсөн огноо
  }),
);
