const dotenv = require('dotenv');
const fetch = require('node-fetch');
const http = require('http');
const { MongoClient } = require('mongodb');

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

const getNumber = async (LoanContracts, contractType) => {
  let preNumbered;

  const latestContracts = await LoanContracts.aggregate([
    {
      $match: {
        contractTypeId: contractType._id,
        number: { $regex: new RegExp(`^${contractType.number}[0-9]+`) },
      },
    },
    {
      $project: {
        number: 1,
        number_len: { $strLenCP: '$number' },
      },
    },
    { $sort: { number_len: -1, number: -1 } },
    { $limit: 1 },
  ]).toArray();

  if (!latestContracts.length) {
    return `${contractType.number}${'0'.repeat(contractType.vacancy - 1)}1`;
  }

  preNumbered = latestContracts[0];

  const preNumber = preNumbered.number;
  const preInt = Number(preNumber.replace(contractType.number, ''));

  const preStrLen = String(preInt).length;
  let lessLen = contractType.vacancy - preStrLen;

  if (lessLen < 0) lessLen = 0;

  return `${contractType.number}${'0'.repeat(lessLen)}${preInt + 1}`;
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
  const customerFilter = { code: 'CIF-13000098' };
  // CIF-13000098

  const customersCount = await Customers.countDocuments(customerFilter);

  let step = 0;
  let per = 10000;
  const schedules = [];

  // const haha = await fetchPolaris('13610210', ['CIF-13000112', 0, 1]);

  // console.log(haha, 'haha');

  // const gg = await fetchPolaris('13610203', ['130013000560']);

  // console.log(gg, 'gg');

  // const jj = await fetchPolaris('13610250', [
  //   {
  //     txnAcntCode: '130013000251',
  //     txnAmount: 100,
  //     rate: 1,
  //     rateTypeId: '16',
  //     // contAcntCode: 'contAcntCode',
  //     contAmount: 100,
  //     contRate: 1,
  //     sourceType: 'OI',
  //     isPreview: 0,
  //     isPreviewFee: 0,
  //     isTmw: 1,
  //   },
  // ]);

  // console.log(jj, 'jj');

  const jj = await fetchPolaris('13610201', [
    '130013000560',
    '2024-04-18',
    '2025-01-18',
    0,
    100,
  ]);

  console.log(jj, 'jj');

  // const hadgalamj = await fetchPolaris('13610312', ['CIF-13000112', 0, 10]);

  // console.log(hadgalamj, 'hadgalamj');

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

  //     const pLoanContracts = await fetchPolaris('13610210', [
  //       customer.code,
  //       0,
  //       0,
  //     ]);

  //     console.log(pLoanContracts, 'pLoanContracts');

  //     for (const pLoanContract of pLoanContracts) {
  //       console.log('---------------------------------------------');
  //       const contractType = await LoanContractTypes.findOne({
  //         code: pLoanContract.prodCode,
  //       });

  //       if (contractType) {
  //         const document = {
  //           _id: nanoid(),
  //           contractTypeId: contractType._id,
  //           number: await getNumber(LoanContracts, contractType),
  //           repayment: 'fixed',
  //           leaseType: 'finance',
  //           currency: pLoanContract.curCode,
  //           customerType: pLoanContract.custType === 0 ? 'customer' : 'company',
  //           customerId: customer._id,
  //           tenor: pLoanContract.termLen,
  //           startDate: new Date(pLoanContract.startDate),
  //           contractDate: new Date(pLoanContract.approvDate),
  //           endDate: new Date(pLoanContract.endDate),
  //           createdAt: new Date(),
  //         };

  //         const loanContract = await LoanContracts.insertOne({ ...document });

  //         const pLoanSchedules = await fetchPolaris('13610203', [
  //           pLoanContract.acntCode,
  //         ]);

  //         for (const schedule of pLoanSchedules) {
  //           schedules.push({
  //             _id: nanoid(),
  //             contractId: loanContract.insertedId.toString(),
  //             status: 'pending',
  //             payDate: new Date(schedule.schdDate),
  //             balance: schedule.totalAmount,
  //             interestNonce: schedule.intAmount,
  //             payment: schedule.totalAmount,
  //             total: schedule.totalAmount,
  //           });
  //         }

  //         await LoanFirstSchedules.insertMany(schedules);

  //         await LoanContracts.updateOne(
  //           { _id: loanContract.insertedId },
  //           {
  //             $set: {
  //               firstPayDate: new Date(pLoanSchedules[0].schdDate),
  //               scheduleDays: [await getMostFrequentPaymentDay(pLoanSchedules)],
  //             },
  //           }
  //         );

  //         const pLoanAccountStatement = await fetchPolaris('13610201', [
  //           pLoanContract.acntCode,
  //           '2024-04-18',
  //           '2025-01-18',
  //           0,
  //           100,
  //         ]);

  //         console.log(pLoanAccountStatement, 'pLoanAccountStatement');
  //       }
  //     }
  //   }

  //   step++;
  // }

  console.log(`Process finished at: ${new Date()}`);

  process.exit();
};

command();
