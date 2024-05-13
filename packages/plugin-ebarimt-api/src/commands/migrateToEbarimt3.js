const fetch = require("node-fetch");
const dotenv = require('dotenv');
const { nanoid } = require("nanoid");
const { MongoClient } = require('mongodb');


dotenv.config();

const MONGO_URL = 'mongodb://127.0.0.1/erxes';

if (!MONGO_URL) {
  throw new Error(`Environment variable MONGO_URL not set.`);
}

const client = new MongoClient(MONGO_URL);
let db;

const taxTypes = {
  '1': 'VAT_ABLE',
  '2': 'VAT_FREE',
  '3': 'VAT_ZERO',
  '5': 'NO_VAT'
}

const rdMap = {
  '0000038': {
    merchantTin: '37900846788',
    posNo: '10003688',
    districtCode: '3420',
    branchNo: '21',
  }
}

const getTinNo = async (rd) => {
  const info = await (0, fetch.default)(
    `https://ebarimt.erkhet.biz/getTinInfo?regNo=${rd}`
  ).then((r) => r.json());

  const tinNo = info.data;
  return tinNo
}

const command = async () => {
  console.log(`start.... ${MONGO_URL}`);
  await client.connect();
  db = client.db();

  console.log('connected...');

  const OldPutResponses = db.collection('put_responses');
  const PutResponses = db.collection('putresponses');

  const putResponses = await OldPutResponses.find({ $or: [{ id: { $exists: false, } }, { inactiveId: { $exists: false } }] }).toArray();
  for (const putRes of putResponses) {
    const doc = { ...putRes };

    await PutResponses.updateOne({ _id: putRes._id }, {
      $set: {
        ...doc,
        state: doc.status,
        status: [true, 'true'].includes(doc.success) ? 'SUCCESS' : 'ERROR',
        receipts: [{
          _id: nanoid(),
          id: doc.billId,
          totalAmount: doc.totalAmount,
          totalVAT: doc.vat,
          totalCityTax: doc.cityTax,
          taxType: taxTypes[doc.taxType],
          merchantTin: rdMap[doc.registerNo].merchantTin,
          items: doc.stocks.map((stock) => (
            {
              ...stock,
              _id: stock._id || nanoid(),
              barCodeType: stock.barCode ? 'GS1' : '',
              taxProductCode: ['2', '3'].includes(doc.taxType) ? stock.barCode : '',
              totalBonus: stock.discount,
              totalVAT: stock.vat,
              totalCityTax: stock.cityTax,
              totalAmount: stock.totalAmount,
            }
          )),
        }],
        id: doc.billId,
        inactiveId: doc.returnBillId,
        totalAmount: doc.totalAmount,
        totalVAT: doc.vat,
        totalCityTax: doc.cityTax,
        type: doc.billType === '3' ? 'B2B_RECEIPT' : 'B2C_RECEIPT',
        easy: false,
        districtCode: rdMap[doc.registerNo].districtCode,
        branchNo: rdMap[doc.registerNo].branchNo,
        merchantTin: rdMap[doc.registerNo].merchantTin,
        posNo: rdMap[doc.registerNo].posNo,
        customerTin: doc.billType === '3' ? await getTinNo(doc.customerNo) : '',
        consumerNo: ''
      }
    }, { upsert: true });
  }

  console.log(`Process finished at: ${new Date()}`);

  process.exit();
};
command();
