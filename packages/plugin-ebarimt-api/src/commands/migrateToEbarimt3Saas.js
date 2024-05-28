const fetch = require("node-fetch");
const dotenv = require('dotenv');
const { nanoid } = require("nanoid");
const { MongoClient } = require('mongodb');
const { rdMap } = require("./tinByRdMap");


dotenv.config();

const { CORE_MONGO_URL, MONGO_URL } = process.env;

if (!MONGO_URL || !CORE_MONGO_URL) {
  throw new Error(`Environment variable MONGO_URL not set.`);
}

const coreClient = new MongoClient(CORE_MONGO_URL);
let coredb;

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
  console.log(`start .....`);

  await coreClient.connect();
  coredb = coreClient.db();

  console.log('connected core db...');

  const Organizations = coredb.collection('organizations');
  const orgs = await Organizations.find().toArray();

  for (const org of orgs) {
    try {

      const PER_MONGO_URL = MONGO_URL.replace(
        '<organizationId>',
        org._id.toString(),
      );

      const client = new MongoClient(PER_MONGO_URL);

      await client.connect();
      const db = client.db();

      console.log('connected...', org.subdomain);

      const OldPutResponses = db.collection('put_responses');
      const PutResponses = db.collection('putresponses');
      const Configs = db.collection('configs');
      const POS = db.collection('pos');

      const ebarimtConfig = await Configs.findOne({ code: 'EBARIMT' });
      if (!ebarimtConfig) {
        console.log(`Process canceled at: ${new Date()}`);
        continue;
      }

      await Configs.updateOne({ code: 'EBARIMT' }, {
        $set: {
          value: {
            ...ebarimtConfig.value || {},
            ebarimtUrl: 'https://ebarimt3.erkhet.biz/',
            checkTaxpayerUrl: 'https://ebarimt-bridge.erkhet.biz'
          }
        }
      })

      const stageInEbarimtConfigs = await Configs.findOne({ code: 'stageInEbarimt' });
      if (stageInEbarimtConfigs) {
        const stageInConfigs = stageInEbarimtConfigs.value;
        for (const key of Object.keys(stageInConfigs)) {
          const companyRD = stageInConfigs[key]?.companyRD || '';
          const mapInfo = rdMap[companyRD] || {};
          stageInConfigs[key].merchantTin = mapInfo.merchantTin || '';
          stageInConfigs[key].posNo = '10003424'
          stageInConfigs[key].districtCode = mapInfo.districtCode || '';
          stageInConfigs[key].branchNo = '01'
        }
        await Configs.updateOne({ code: 'stageInEbarimt' }, {
          $set: {
            value: {
              ...stageInConfigs || {}
            }
          }
        })
      }

      const poss = await POS.find({ status: { $ne: 'deleted' } }).toArray();
      for (const pos of poss) {
        const comRD = pos.ebarimtConfig?.companyRD;
        const info = rdMap[comRD] || {};

        await POS.updateOne({ _id: pos._id }, {
          $set: {
            ebarimtConfig: {
              ...pos.ebarimtConfig,
              posNo: '10003424',
              ebarimtUrl: 'https://ebarimt3.erkhet.biz',
              merchantTin: info.merchantTin || '',
              districtCode: info.districtCode || '',
              branchNo: '01',
              checkTaxpayerUrl: 'https://ebarimt-bridge.erkhet.biz'
            }
          }
        })
      }

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
            totalAmount: doc.totalAmount,
            totalVAT: doc.vat,
            totalCityTax: doc.cityTax,
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
        }, { upsert: true });
      }

      client.close();
      console.log(`migrating ${org.subdomain}`);
    } catch (e) {
      console.log(e);
      continue;
    }
  }

  console.log(`Process finished at: ${new Date()}`);

  process.exit();
};

command();
