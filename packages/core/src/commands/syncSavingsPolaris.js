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
  const customerFilter = { code: { $exists: true } };
  // const customerFilter = { code: 'CIF-13000112' };
  // CIF-13000098
  // CIF-13000112

  const customersCount = await Customers.countDocuments(customerFilter);

  let step = 0;
  let per = 10000;
  const schedules = [];

  while (step * per < customersCount) {
    const skip = step * per;
    const customers = await Customers.find(customerFilter)
      .sort({ code: 1 })
      .skip(skip)
      .limit(per)
      .toArray();

    let bulkOps = [];

    for (const customer of customers) {
      if (!customer.code) {
        continue;
      }

      const getAccounts = await fetchPolaris('13610312', [
        customer.code,
        0,
        20,
      ]);

      const termDeposits = getAccounts.filter(
        (account) => account.acntType === 'TD'
      );

      if (termDeposits.length > 0) {
        for (const deposit of termDeposits) {
          const detailDeposit = await fetchPolaris('13610100', [
            deposit.acntCode,
            '0',
          ]);

          const type = await SavingContractTypes.findOne({
            code: deposit.prodCode,
          });

          const contract = await SavingContracts.findOne({
            number: deposit.acntCode,
          });

          if (type && !contract) {
            const document = {
              _id: nanoid(),
              contractTypeId: type._id,
              status: 'normal',
              number: detailDeposit.acntCode,
              customerType: 'customer',
              customerId: customer._id,
              savingAmount: detailDeposit.currentBal,
              duration: detailDeposit.termLen,
              interestRate: detailDeposit.intRate,
              currency: 'MNT',
              startDate: new Date(detailDeposit.startDate),
              createdAt: new Date(detailDeposit.createdDate),
            };

            // await SavingContracts.insertOne({ ...document });
          }
        }
      }
    }

    step++;
  }

  console.log(`Process finished at: ${new Date()}`);

  process.exit();
};

command();
