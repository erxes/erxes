import {
  syncCollateral,
  syncSchedules,
  syncTransactions,
} from './syncCollateralPolaris';

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
let LoanContracts;
let LoanContractTypes;
let LoanFirstSchedules;
let LoanSchedules;
let LoanTransaction;
let Products;
let ProductCategories;

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
  LoanContracts = db.collection('loan_contracts');
  LoanContractTypes = db.collection('loan_contract_types');
  LoanFirstSchedules = db.collection('loan_first_schedules');
  LoanSchedules = db.collection('loan_schedules');
  LoanTransaction = db.collection('loan_transactions');
  Products = db.collection('products');
  ProductCategories = db.collection('product_categories');

  console.log(`Process start at: ${new Date()}`);
  // const customerFilter = { code: { $exists: true } };
  const customerFilter = { code: 'CIF-13000112' };
  // CIF-13000098
  // CIF-13000112

  const customersCount = await Customers.countDocuments(customerFilter);

  let step = 0;
  let per = 10000;

  // const pLoanContracts = await fetchPolaris('13610210', [
  //   'CIF-13000112',
  //   0,
  //   20
  // ]);

  const huulga = await fetchPolaris('13610201', [
    '130013000562',
    '2025-03-28',
    '2025-07-28',
    0,
    100,
  ]);

  console.log(huulga, 'huulga');

  await syncTransactions(
    huulga,
    LoanTransaction,
    LoanSchedules,
    LoanContracts,
    'IFmfkRSuJXnNClNJlDwxI'
  );

  // while (step * per < customersCount) {
  //   const skip = step * per;
  //   const customers = await Customers.find(customerFilter)
  //     .sort({ code: 1 })
  //     .skip(skip)
  //     .limit(per)
  //     .toArray();

  //   for (const customer of customers) {
  //     if (!customer.code) {
  //       continue;
  //     }

  //     const pLoanContracts = await fetchPolaris('13610210', [
  //       customer.code,
  //       0,
  //       20
  //     ]);

  //     const filteredContracts = pLoanContracts.filter(
  //       (contract) => contract.acntCode === '130013000562'
  //     );

  //     for (const pLoanContract of filteredContracts) {
  //       console.log('---------------------------------------------');

  //       const contractDetail = await fetchPolaris('13610200', [
  //         pLoanContract.acntCode,
  //         0
  //       ]);

  //       const collaterals = await fetchPolaris('13610904', [
  //         pLoanContract.acntCode
  //       ]);

  //       const contractType = await LoanContractTypes.findOne({
  //         code: contractDetail.prodCode
  //       });

  //       const createdContract = await LoanContracts.findOne({
  //         number: contractDetail.acntCode
  //       });

  //       /**
  //        * sync loan contract
  //        */

  //       if (contractType && !createdContract) {
  //         const document = {
  //           _id: nanoid(),
  //           contractTypeId: contractType._id,
  //           number: contractDetail.acntCode,
  //           repayment: 'fixed',
  //           leaseType: 'finance',
  //           currency: contractDetail.curCode,
  //           customerType:
  //             contractDetail.custType === 0 ? 'customer' : 'company',
  //           customerId: customer._id,
  //           tenor: contractDetail.termLen,
  //           leaseAmount: contractDetail.approvAmount,
  //           interestRate: contractDetail.baseFixedIntRate,
  //           startDate: new Date(contractDetail.startDate),
  //           contractDate: new Date(contractDetail.approvDate),
  //           endDate: new Date(contractDetail.endDate),
  //           createdAt: new Date()
  //         };

  //         const updatedDocument = await syncCollateral(
  //           ProductCategories,
  //           Products,
  //           collaterals,
  //           document
  //         );

  //         const loanContract = await LoanContracts.insertOne({
  //           ...updatedDocument
  //         });

  //         /**
  //          * sync loan schedules
  //          */

  //         const pLoanSchedules = await fetchPolaris('13610203', [
  //           pLoanContract.acntCode
  //         ]);

  //         await syncSchedules(
  //           LoanFirstSchedules,
  //           LoanContracts,
  //           pLoanSchedules,
  //           loanContract
  //         );

  //         /**
  //          * sync loan transaction
  //          */

  //         const huulga = await fetchPolaris('13610201', [
  //           pLoanContract.acntCode,
  //           moment(pLoanContract.startDate).format('YYYY-MM-DD'),
  //           moment(pLoanContract.endDate).format('YYYY-MM-DD'),
  //           0,
  //           100
  //         ]);

  //         console.log(huulga, 'huulga');

  //         await syncTransactions(
  //           huulga,
  //           LoanTransaction,
  //           LoanSchedules,
  //           LoanContracts,
  //           loanContract
  //         );
  //       }
  //     }
  //   }

  //   step++;
  // }

  console.log(`Process finished at: ${new Date()}`);

  process.exit();
};

command();
