const dotenv = require('dotenv');
const fetch = require('node-fetch');
const http = require('http');
const { MongoClient } = require('mongodb');
const moment = require('moment');

dotenv.config();

// const { MONGO_URL } = process.env;
const MONGO_URL = 'mongodb://127.0.0.1:27017/erxes?directConnection=true';

if (!MONGO_URL) {
  throw new Error(`Environment variable MONGO_URL not set.`);
}

const client = new MongoClient(MONGO_URL);
let db;
let Customers;
let Companies;
let LoanContracts;
let LoanContractTypes;
let LoanFirstSchedules;
let LoanSchedules;
let SavingContracts;
let SavingContractTypes;

const nanoid = (len = 21) => {
  const charSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

  let randomString = '';

  for (let i = 0; i < len; i++) {
    const position = Math.floor(Math.random() * charSet.length);
    randomString += charSet.substring(position, position + 1);
  }

  return randomString;
};

const getNumber = async (SavingContracts, type, contractTypeId) => {
  const preNumbered = await SavingContracts.findOne(
    {
      contractTypeId: contractTypeId,
    },
    {},
    { sort: { createdAt: -1 } }
  );

  if (!preNumbered) {
    return `${type.number}${'0'.repeat(type.vacancy - 1)}1`;
  }

  const preNumber = preNumbered.number;
  const preInt = Number(preNumber.replace(type.number, ''));

  const preStrLen = String(preInt).length;
  let lessLen = type.vacancy - preStrLen;

  if (lessLen < 0) lessLen = 0;

  return `${type.number}${'0'.repeat(lessLen)}${preInt + 1}`;
};

const getMostFrequentPaymentDay = async (schedule) => {
  if (!Array.isArray(schedule) || schedule.length === 0) {
    throw new Error('Invalid schedule data');
  }

  const dayCounts = {};

  schedule.forEach((item) => {
    const day = new Date(item.schdDate).getDate();
    dayCounts[day] = (dayCounts[day] || 0) + 1;
  });

  return Object.keys(dayCounts).reduce((a, b) =>
    dayCounts[a] > dayCounts[b] ? a : b
  );
};

const fetchPolaris = async (op, body) => {
  const headers = {
    Op: op,
    Cookie: `NESSESSION=03tv40BnPzFEEcGgsFxkhrAUTN7Awh`,
    Company: '13',
    Role: '45',
    'Content-Type': 'application/json',
  };
  const url = `http://202.131.242.158:4139/nesWeb/NesFront`;
  const requestOptions = {
    url,
    method: 'POST',
    headers,
    body: JSON.stringify(body),
    agent: new http.Agent({ keepAlive: true }),
  };

  const realResponse = await fetch(url, requestOptions)
    .then(async (response) => {
      if (!response.ok) {
        const respErr = await response.text();
        throw new Error(respErr);
      }

      return response.text();
    })
    .then((response) => {
      try {
        return JSON.parse(response);
      } catch (e) {
        return response;
      }
    })
    .catch((e) => {
      throw new Error(e.message);
    });

  return realResponse;
};

const command = async () => {
  await client.connect();
  console.log(Boolean(client));
  db = client.db();
  console.log(Boolean(db));

  Customers = db.collection('customers');
  Companies = db.collection('companies');
  LoanContracts = db.collection('loan_contracts');
  LoanContractTypes = db.collection('loan_contract_types');
  LoanFirstSchedules = db.collection('loan_first_schedules');
  LoanSchedules = db.collection('loan_schedules');
  SavingContracts = db.collection('saving_contracts');
  SavingContractTypes = db.collection('saving_contract_types');

  console.log(`Process start at: ${new Date()}`);
  // const customerFilter = { code: { $exists: true } };
  const customerFilter = { code: 'CIF-13000112' };
  // CIF-13000098
  // CIF-13000112

  const customersCount = await Customers.countDocuments(customerFilter);

  let step = 0;
  let per = 10000;
  const schedules = [];

  const hadgalamj = await fetchPolaris('13610658', ['130011000031']);

  console.log(hadgalamj, 'hadgalamj');

  const type = await SavingContractTypes.findOne({ code: hadgalamj.prodCode });

  // if (type) {
  //   const document = {
  //     _id: nanoid(),
  //     contractTypeId: type._id,
  //     status: 'normal',
  //     number: await getNumber(SavingContracts, type, type._id),
  //     customerType: 'customer',
  //     savingAmount: hadgalamj.currentBal,
  //     duration: hadgalamj.termLen,
  //     interestRate: hadgalamj.intRate,
  //     currency: 'MNT',
  //     startDate: new Date(hadgalamj.startDate),
  //     createdAt: new Date(hadgalamj.createdDate),
  //   };

  //   await SavingContracts.insertOne({ ...document });
  // }

  // while (step * per < customersCount) {
  //   const skip = step * per;
  //   const customers = await Customers.find(customerFilter)
  //     .sort({ code: 1 })
  //     .skip(skip)
  //     .limit(per)
  //     .toArray();

  //   let bulkOps = [];

  //   for (const customer of customers) {
  //     if (!customer.code) {
  //       continue;
  //     }
  //   }

  //   step++;
  // }

  console.log(`Process finished at: ${new Date()}`);

  process.exit();
};

command();
