// const dotenv = require('dotenv');
// const fetch = require('node-fetch');
// const http = require('http');
// const { MongoClient } = require('mongodb');
// const moment = require('moment');

// dotenv.config();

// // const { MONGO_URL } = process.env;
// const MONGO_URL = 'mongodb://127.0.0.1:27017/erxes?directConnection=true';

// if (!MONGO_URL) {
//   throw new Error(`Environment variable MONGO_URL not set.`);
// }

// const client = new MongoClient(MONGO_URL);
// let db;
// let Customers;
// let Companies;
// let LoanContracts;
// let LoanContractTypes;
// let LoanFirstSchedules;
// let LoanSchedules;
// let LoanTransaction;
// let SavingContracts;
// let SavingContractTypes;
// let Products;
// let ProductCategories;

// const nanoid = (len = 21) => {
//   const charSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

//   let randomString = '';

//   for (let i = 0; i < len; i++) {
//     const position = Math.floor(Math.random() * charSet.length);
//     randomString += charSet.substring(position, position + 1);
//   }

//   return randomString;
// };

// const getMostFrequentPaymentDay = async (schedule) => {
//   if (!Array.isArray(schedule) || schedule.length === 0) {
//     throw new Error('Invalid schedule data');
//   }

//   const dayCounts = {};

//   schedule.forEach((item) => {
//     const day = new Date(item.schdDate).getDate();
//     dayCounts[day] = (dayCounts[day] || 0) + 1;
//   });

//   return Object.keys(dayCounts).reduce((a, b) =>
//     dayCounts[a] > dayCounts[b] ? a : b
//   );
// };

// const dateGroup = async (data) => {
//   const groupedByDate = data.txns.reduce((acc, txn) => {
//     const date = txn.postDate.split('T')[0]; // Extract YYYY-MM-DD
//     if (!acc[date]) {
//       acc[date] = [];
//     }
//     acc[date].push(txn);
//     return acc;
//   }, {});

//   console.log(groupedByDate);
// };

// const fetchPolaris = async (op, body) => {
//   const headers = {
//     Op: op,
//     Cookie: `NESSESSION=03tv40BnPzFEEcGgsFxkhrAUTN7Awh`,
//     Company: '13',
//     Role: '45',
//     'Content-Type': 'application/json',
//   };
//   const url = `http://202.131.242.158:4139/nesWeb/NesFront`;
//   const requestOptions = {
//     url,
//     method: 'POST',
//     headers,
//     body: JSON.stringify(body),
//     agent: new http.Agent({ keepAlive: true }),
//   };

//   const realResponse = await fetch(url, requestOptions)
//     .then(async (response) => {
//       if (!response.ok) {
//         const respErr = await response.text();
//         throw new Error(respErr);
//       }

//       return response.text();
//     })
//     .then((response) => {
//       try {
//         return JSON.parse(response);
//       } catch (e) {
//         return response;
//       }
//     })
//     .catch((e) => {
//       throw new Error(e.message);
//     });

//   return realResponse;
// };

// const command = async () => {
//   await client.connect();
//   console.log(Boolean(client));
//   db = client.db();
//   console.log(Boolean(db));

//   Customers = db.collection('customers');
//   Companies = db.collection('companies');
//   LoanContracts = db.collection('loan_contracts');
//   LoanContractTypes = db.collection('loan_contract_types');
//   LoanFirstSchedules = db.collection('loan_first_schedules');
//   LoanSchedules = db.collection('loan_schedules');
//   LoanTransaction = db.collection('loan_transactions');
//   SavingContracts = db.collection('saving_contracts');
//   SavingContractTypes = db.collection('saving_contract_types');
//   Products = db.collection('products');
//   ProductCategories = db.collection('product_categories');

//   console.log(`Process start at: ${new Date()}`);
//   // const customerFilter = { code: { $exists: true } };
//   const customerFilter = { code: 'CIF-13000112' };
//   // CIF-13000098
//   // CIF-13000112

//   const customersCount = await Customers.countDocuments(customerFilter);

//   let step = 0;
//   let per = 10000;
//   const schedules = [];

//   while (step * per < customersCount) {
//     const skip = step * per;
//     const customers = await Customers.find(customerFilter)
//       .sort({ code: 1 })
//       .skip(skip)
//       .limit(per)
//       .toArray();

//     let bulkOps = [];

//     for (const customer of customers) {
//       if (!customer.code) {
//         continue;
//       }

//       const pLoanContracts = await fetchPolaris('13610210', [
//         customer.code,
//         0,
//         1,
//       ]);

//       const filteredContracts = pLoanContracts.filter(
//         (contract) => contract.statusName !== 'Хаасан'
//       );

//       for (const pLoanContract of filteredContracts) {
//         console.log('---------------------------------------------');

//         const contractDetail = await fetchPolaris('13610200', [
//           pLoanContract.acntCode,
//           0,
//         ]);

//         const collaterals = await fetchPolaris('13610904', [
//           pLoanContract.acntCode,
//         ]);

//         const contractType = await LoanContractTypes.findOne({
//           code: contractDetail.prodCode,
//         });

//         const createdContract = await LoanContracts.findOne({
//           number: contractDetail.acntCode,
//         });

//         if (contractType && !createdContract) {
//           const document = {
//             _id: nanoid(),
//             contractTypeId: contractType._id,
//             number: contractDetail.acntCode,
//             repayment: 'fixed',
//             leaseType: 'finance',
//             currency: contractDetail.curCode,
//             customerType:
//               contractDetail.custType === 0 ? 'customer' : 'company',
//             customerId: customer._id,
//             tenor: contractDetail.termLen,
//             leaseAmount: contractDetail.approvAmount,
//             interestRate: contractDetail.baseFixedIntRate,
//             startDate: new Date(contractDetail.startDate),
//             contractDate: new Date(contractDetail.approvDate),
//             endDate: new Date(contractDetail.endDate),
//             createdAt: new Date(),
//           };

//           if (collaterals.length > 0) {
//             document.collateralsData = [];

//             for (const item of collaterals) {
//               const detailCollateral = await fetchPolaris('13610906', [
//                 item.acntCode,
//               ]);

//               const product = await Products.findOne({
//                 code: item.acntCode,
//               });

//               if (!product) {
//                 let categoryId;
//                 const findCategory = await ProductCategories.findOne({
//                   code: detailCollateral.acntCode,
//                 });

//                 if (findCategory) {
//                   categoryId = findCategory._id;
//                 } else {
//                   const createCategory = await ProductCategories.insertOne({
//                     _id: nanoid(),
//                     name: `${item.acntName} ${item.linkTypeName}`,
//                     code: detailCollateral.acntCode,
//                     order: `${detailCollateral.acntCode}/`,
//                     status: 'active',
//                     createdAt: new Date(),
//                   });

//                   categoryId = createCategory.insertedId;
//                 }

//                 const createProduct = await Products.insertOne({
//                   _id: nanoid(),
//                   name: `${item.acntName} ${item.linkTypeName}`,
//                   code: item.acntCode,
//                   unitPrice: detailCollateral.price,
//                   categoryId,
//                   createdAt: new Date(),
//                 });

//                 document.collateralsData.push({
//                   _id: nanoid(),
//                   collateralId: createProduct.insertedId,
//                   cost: detailCollateral.price,
//                   percent: 0,
//                   marginAmount: 0,
//                   leaseAmount: item.useAmount,
//                   currency: item.useCurCode,
//                   certificate: detailCollateral.key2,
//                   vinNumber: detailCollateral.key,
//                 });
//               } else {
//                 // Optional: If you want to handle case when product exists
//                 document.collateralsData.push({
//                   _id: nanoid(),
//                   collateralId: product._id,
//                   cost: detailCollateral.useAmount,
//                   percent: 0,
//                   marginAmount: 0,
//                   leaseAmount: item.useAmount,
//                   currency: item.useCurCode,
//                   certificate: detailCollateral.key2,
//                   vinNumber: detailCollateral.key,
//                 });
//               }
//             }
//           }

//           const loanContract = await LoanContracts.insertOne({ ...document });

//           const pLoanSchedules = await fetchPolaris('13610203', [
//             pLoanContract.acntCode,
//           ]);

//           const schedules = pLoanSchedules.map((schedule) => ({
//             _id: nanoid(),
//             contractId: loanContract.insertedId.toString(),
//             status: 'pending',
//             payDate: new Date(schedule.schdDate),
//             balance: schedule.totalAmount,
//             interestNonce: schedule.intAmount,
//             payment: schedule.totalAmount,
//             total: schedule.totalAmount,
//           }));

//           await LoanFirstSchedules.insertMany(schedules);

//           await LoanContracts.updateOne(
//             { _id: loanContract.insertedId },
//             {
//               $set: {
//                 firstPayDate: new Date(pLoanSchedules[0].schdDate),
//                 scheduleDays: [await getMostFrequentPaymentDay(pLoanSchedules)],
//               },
//             }
//           );

//           // const huulga = await fetchPolaris('13610201', [
//           //   pLoanContract.acntCode,
//           //   moment(pLoanContract.startDate).format('YYYY-MM-DD'),
//           //   moment(pLoanContract.endDate).format('YYYY-MM-DD'),
//           //   0,
//           //   100,
//           // ]);

//           // console.log(huulga, 'huulga');

//           // for (const data of huulga.txns) {
//           //   const doc = {
//           //     _id: nanoid(),
//           //     contractId: loanContract.insertedId,
//           //     payDate: new Date(data.postDate),
//           //     description: data.txnDesc,
//           //     currency: data.curCode,
//           //     payment: data.income,
//           //   };

//           //   await LoanTransaction.insertOne({ ...doc });
//           // }
//         }
//       }
//     }

//     step++;
//   }

//   console.log(`Process finished at: ${new Date()}`);

//   process.exit();
// };

// command();
