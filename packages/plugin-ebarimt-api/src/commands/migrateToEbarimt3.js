const fetch = require("node-fetch");
const dotenv = require('dotenv');
const { nanoid } = require("nanoid");
const { MongoClient } = require('mongodb');
const { rdMap } = require("./tinByRdMap");

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

const getTinNo = async (rd) => {
  const info = await fetch(
    `https://ebarimt-bridge.erkhet.biz/getTinInfo?regNo=${rd}`
  ).then((r) => r.json());

  return info.data;
}

const command = async () => {
  console.log(`start.... ${MONGO_URL}`);
  await client.connect();
  db = client.db();

  console.log('connected...');

  const OldPutResponses = db.collection('put_responses');
  const PutResponses = db.collection('putresponses');
  const Configs = db.collection('configs');
  const POS = db.collection('pos');

  const ebarimtConfig = await Configs.findOne({ code: 'EBARIMT' });
  if (!ebarimtConfig) {
    console.log(`Process canceled at: ${new Date()}`);
    return;
  }

  let step = 0;
  let per = 1000;

  const summaryCount = await OldPutResponses.countDocuments({ $or: [{ id: { $exists: false, } }, { inactiveId: { $exists: false } }] });

  while (step * per < summaryCount) {
    const skip = step * per;
    console.log(skip, per)
    const putResponses = await OldPutResponses.find({ $or: [{ id: { $exists: false, } }, { inactiveId: { $exists: false } }] }).sort({ createdAt: 1 }).skip(skip).limit(per).toArray();

    let bulkOps = [];

    for (const putRes of putResponses) {
      const doc = { ...putRes };

      bulkOps.push({
        updateOne: {
          filter: {
            _id: putRes._id
          },
          update: {
            $set: {
              ...doc,
              state: doc.status,
              status: [true, 'true'].includes(doc.success) ? 'SUCCESS' : 'ERROR',
              receipts: [{
                _id: nanoid(),
                id: doc.billId,
                totalAmount: Number(doc.amount),
                totalVAT: doc.vat,
                totalCityTax: doc.cityTax,
                taxType: taxTypes[doc.taxType],
                merchantTin: rdMap[doc.registerNo]?.merchantTin,
                items: (doc.stocks || []).map((stock) => (
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
              totalAmount: Number(doc.amount),
              totalVAT: Number(doc.vat),
              totalCityTax: Number(doc.cityTax),
              type: doc.billType === '3' ? 'B2B_RECEIPT' : 'B2C_RECEIPT',
              easy: false,
              districtCode: rdMap[doc.registerNo]?.districtCode,
              branchNo: '01',
              merchantTin: rdMap[doc.registerNo]?.merchantTin,
              posId: 'eb2',
              posNo: '10003424',
              customerTin: doc.billType === '3' ? await getTinNo(doc.customerNo) : '',
              customerName: doc.customerName,
              consumerNo: ''
            }
          },
          upsert: true
        },
      });
    }
    await PutResponses.bulkWrite(bulkOps)
    step++
  }

  console.log(`Process finished at: ${new Date()}`);

  process.exit();
};

command();
