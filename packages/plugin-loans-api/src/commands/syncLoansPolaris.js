const dotenv = require('dotenv');
const fetch = require('node-fetch');
const http = require('http');
const { MongoClient } = require('mongodb');
const moment = require('moment');
const BigNumber = require('bignumber.js').BigNumber;

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
let LoanPurpose;
let Branches;
let Users;

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
    'Content-Type': 'application/json'
  };
  const url = `http://202.131.242.158:4139/nesWeb/NesFront`;
  const requestOptions = {
    url,
    method: 'POST',
    headers,
    body: JSON.stringify(body),
    agent: new http.Agent({ keepAlive: true })
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
  LoanPurpose = db.collection('loan_purposes');
  Branches = db.collection('branches');
  Users = db.collection('users');

  console.log(`Process start at: ${new Date()}`);
  const customerFilter = { code: { $exists: true } };

  const customersCount = await Customers.countDocuments(customerFilter);

  let step = 0;
  let per = 10000;

  while (step * per < customersCount) {
    const skip = step * per;
    const customers = await Customers.find(customerFilter)
      .sort({ code: 1 })
      .skip(skip)
      .limit(per)
      .toArray();

    for (const customer of customers) {
      if (!customer.code) {
        continue;
      }

      const pLoanContracts = await fetchPolaris('13610210', [
        customer.code,
        0,
        20
      ]);

      const filteredContracts = pLoanContracts.filter(
        (contract) => contract.statusName !== 'Хаасан'
      );

      for (const pLoanContract of filteredContracts) {
        console.log('---------------------------------------------');

        const contractDetail = await fetchPolaris('13610200', [
          pLoanContract.acntCode,
          0
        ]);

        const collaterals = await fetchPolaris('13610904', [
          pLoanContract.acntCode
        ]);

        const contractType = await LoanContractTypes.findOne({
          code: contractDetail.prodCode
        });

        const createdContract = await LoanContracts.findOne({
          number: contractDetail.acntCode
        });

        const branch = await Branches.findOne({
          code: contractDetail.brchCode
        });

        const user = await Users.findOne({
          employeeId: String(contractDetail.acntManager)
        });

        const purpose = await LoanPurpose.findOne({
          code: contractDetail.purpose
        });

        const subPurpose = await LoanPurpose.findOne({
          code: contractDetail.subPurpose
        });

        /**
         * sync loan contract
         */

        if (contractType && !createdContract) {
          const document = {
            _id: nanoid(),
            contractTypeId: contractType._id,
            number: contractDetail.acntCode,
            repayment: 'fixed',
            leaseType: 'finance',
            currency: contractDetail.curCode,
            branchId: branch ? branch._id : '',
            customerType:
              contractDetail.custType === 0 ? 'customer' : 'company',
            customerId: customer._id,
            tenor: contractDetail.termLen,
            loanPurpose: subPurpose ? subPurpose._id : '',
            loanDestination: purpose ? purpose._id : '',
            isSyncedPolaris: true,
            isActiveLoan: true,
            leaseAmount: contractDetail.approvAmount,
            interestRate: contractDetail.baseFixedIntRate,
            startDate: new Date(contractDetail.startDate),
            contractDate: new Date(contractDetail.approvDate),
            endDate: new Date(contractDetail.endDate),
            createdAt: new Date(),
            leasingExpertId: user ? user._id : '',
            holidayType: 'before',
            useManualNumbering: null,
            status: 'normal',
            classification: 'NORMAL',
            marginAmount: null,
            feeAmount: 0,
            lossPercent: 20,
            lossCalcType: 'fromInterest',
            skipAmountCalcMonth: null,
            insuranceAmount: 0,
            debt: null,
            debtTenor: null,
            debtLimit: null,
            weekends: [],
            overPaymentIsNext: false,
            scopeBrandIds: [],
            collateralsData: [],
            insurancesData: [],
            relCustomers: [],
            customFieldsData: [],
            scheduleDays: [],
            isSyncedSchedules: true,
            isSyncedCollateral: true
          };

          const updatedDocument = await syncCollateral(
            ProductCategories,
            Products,
            collaterals,
            document
          );

          const loanContract = await LoanContracts.insertOne({
            ...updatedDocument
          });

          /**
           * sync loan schedules
           */

          const pLoanSchedules = await fetchPolaris('13610203', [
            pLoanContract.acntCode
          ]);

          await syncSchedules(
            LoanFirstSchedules,
            LoanContracts,
            pLoanSchedules,
            loanContract
          );

          /**
           * sync loan transaction
           */

          const huulga = await fetchPolaris('13610201', [
            pLoanContract.acntCode,
            moment(pLoanContract.startDate).format('YYYY-MM-DD'),
            moment(pLoanContract.endDate).format('YYYY-MM-DD'),
            0,
            100
          ]);

          await syncTransactions(
            huulga,
            contractDetail.approvAmount,
            LoanTransaction,
            LoanSchedules,
            LoanContracts,
            loanContract
          );
        }
      }
    }

    step++;
  }

  console.log(`Process finished at: ${new Date()}`);

  process.exit();
};

command();

const dateGroup = async (data, aprvAmnt) => {
  if (!data || !Array.isArray(data.txns)) {
    throw new Error('Invalid input: data.txns must be an array');
  }

  // Step 1: Filter transactions with income !== 0
  const filtered = data.txns;
  // .filter(
  //   (txn) =>
  //     txn.income !== 0 || txn.outcome === aprvAmnt || txn.balance === aprvAmnt
  // );

  // Step 2: Sort by postDate
  filtered.sort((a, b) => {
    const dateA = new Date(a.postDate).getTime();
    const dateB = new Date(b.postDate).getTime();
    return dateA - dateB;
  });

  return filtered;
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

const getFullDate = (date) => {
  return new Date(moment(date).format('YYYY-MM-DD'));
};

const getDiffDay = (fromDate, toDate) => {
  const date1 = getFullDate(fromDate);
  const date2 = getFullDate(toDate);
  return (date2.getTime() - date1.getTime()) / (1000 * 3600 * 24);
};

const getAmountByPriority = (total, params) => {
  const {
    debt,
    loss,
    storedInterest,
    interestEve,
    interestNonce,
    payment,
    insurance
  } = params;

  const result = {
    status: 'less',
    didPayment: 0,
    didLoss: 0,
    didInterestEve: 0,
    didInterestNonce: 0,
    didInsurance: 0,
    didDebt: 0,
    didStoredInterest: 0
  };

  let mainAmount = total;

  if (debt > mainAmount) {
    result.didDebt = mainAmount;
    return result;
  }

  result.didDebt = debt;
  mainAmount = mainAmount - debt;
  if (loss > mainAmount) {
    result.didLoss = mainAmount;
    return result;
  }

  result.didLoss = loss;
  mainAmount = mainAmount - loss;
  if (storedInterest > mainAmount) {
    result.didStoredInterest = mainAmount;
    return result;
  }

  result.didStoredInterest = storedInterest;
  mainAmount = mainAmount - storedInterest;
  if (interestEve > mainAmount) {
    result.didInterestEve = mainAmount;
    return result;
  }

  result.didInterestEve = interestEve;
  mainAmount = mainAmount - interestEve;
  if (interestNonce > mainAmount) {
    result.didInterestNonce = mainAmount;
    return result;
  }

  result.didInterestNonce = interestNonce;
  mainAmount = mainAmount - interestNonce;
  if (payment > mainAmount) {
    result.didPayment = mainAmount;
    return result;
  }

  result.status = 'done';
  result.didPayment = payment;
  mainAmount = mainAmount - payment;
  if (insurance > mainAmount) {
    result.didInsurance = mainAmount;
    return result;
  }

  result.didInsurance = insurance;
  mainAmount = mainAmount - insurance;
  result.didPayment = result.didPayment + mainAmount;

  return result;
};

const calcInterest = ({
  balance,
  interestRate,
  dayOfMonth = 30,
  fixed = 2
}) => {
  const interest = new BigNumber(interestRate).div(100).div(365);
  return new BigNumber(balance)
    .multipliedBy(interest)
    .multipliedBy(dayOfMonth)
    .dp(fixed, BigNumber.ROUND_HALF_UP)
    .toNumber();
};

const calcLoss = async (contract, paymentInfo, lossPercent, diff) => {
  let result = 0;

  switch (contract.lossCalcType) {
    case 'fromAmount':
      result = new BigNumber(paymentInfo.payment)
        .multipliedBy(new BigNumber(lossPercent).div(100))
        .multipliedBy(diff)
        .dp(2, BigNumber.ROUND_HALF_UP)
        .toNumber();
      break;

    case 'fromInterest':
      result = new BigNumber(paymentInfo.interest)
        .multipliedBy(new BigNumber(lossPercent).div(100))
        .multipliedBy(diff)
        .dp(2, BigNumber.ROUND_HALF_UP)
        .toNumber();
      break;

    case 'fromTotalPayment':
      result = new BigNumber(
        new BigNumber(paymentInfo.payment).plus(paymentInfo.interest)
      )
        .multipliedBy(new BigNumber(lossPercent).div(100))
        .multipliedBy(diff)
        .dp(2, BigNumber.ROUND_HALF_UP)
        .toNumber();
      break;

    default:
      result = new BigNumber(paymentInfo.balance)
        .multipliedBy(new BigNumber(lossPercent).div(100))
        .multipliedBy(diff)
        .dp(2, BigNumber.ROUND_HALF_UP)
        .toNumber();
      break;
  }
  return result;
};

const getDaysInMonth = (date) => {
  const ndate = getFullDate(date);
  const year = ndate.getFullYear();
  const month = ndate.getMonth() + 1;
  // Here January is 1 based
  //Day 0 is the last day in the previous month
  return new Date(year, month, 0).getDate();
  // Here January is 0 based
  // return new Date(year, month+1, 0).getDate();
};

const getDatesDiffMonth = (fromDate, toDate) => {
  const fDate = getFullDate(fromDate);
  const tDate = getFullDate(toDate);

  if (fDate.getMonth() === tDate.getMonth()) {
    return {
      diffEve: getDiffDay(fromDate, toDate),
      diffNonce: 0
    };
  }

  const year = fDate.getFullYear();
  const month = fDate.getMonth();
  const lastDate = new Date(year, month, getDaysInMonth(fDate));

  return {
    diffEve: getDiffDay(fromDate, lastDate),
    diffNonce: getDiffDay(lastDate, toDate)
  };
};

const getCalcedAmountsOnDate = async (
  LoanSchedules,
  contract,
  date,
  calculationFixed
) => {
  if (!calculationFixed) {
    calculationFixed = 2;
  }
  const currentDate = getFullDate(date);
  const result = {
    // status: 'pending' | 'done' | 'skipped' | 'pre' | 'less' | 'expired' | 'give';
    balance: 0,
    didBalance: 0,
    unUsedBalance: 0,

    loss: 0,
    interestEve: 0,
    interestNonce: 0,
    storedInterest: 0,
    commitmentInterest: 0,
    payment: 0,
    insurance: 0,
    debt: 0,
    total: 0,
    giveAmount: 0,
    calcInterest: 0,
    closeAmount: 0
  };
  const preSchedule = await LoanSchedules.findOne(
    {
      contractId: contract._id,
      payDate: { $lte: currentDate },
      didBalance: { $exists: true, $gte: 0 }
    },
    { sort: { payDate: -1, createdAt: -1 } }
  );

  if (!preSchedule) {
    return result;
  }

  const skippedSchedules = await LoanSchedules.find(
    {
      contractId: contract._id,
      payDate: { $gt: preSchedule.payDate, $lte: currentDate }
    },
    { sort: { payDate: -1, createdAt: -1 } }
  );

  const diffDay = getDiffDay(preSchedule.payDate, currentDate);
  if (!diffDay) {
    return {
      balance: preSchedule.balance ?? 0,
      didBalance: preSchedule.didBalance ?? 0,
      unUsedBalance: preSchedule.unUsedBalance ?? 0,

      loss: (preSchedule.loss ?? 0) - (preSchedule.didLoss ?? 0),
      interestEve:
        (preSchedule.interestEve ?? 0) - (preSchedule.didInterestEve ?? 0),
      interestNonce:
        (preSchedule.interestNonce ?? 0) - (preSchedule.didInterestNonce ?? 0),
      storedInterest:
        (preSchedule.storedInterest ?? 0) -
        (preSchedule.didStoredInterest ?? 0),
      commitmentInterest: preSchedule.commitmentInterest ?? 0,
      payment: (preSchedule.payment ?? 0) - (preSchedule.didPayment ?? 0),
      insurance: (preSchedule.insurance ?? 0) - (preSchedule.didInsurance ?? 0),
      debt: (preSchedule.debt ?? 0) - (preSchedule.didDebt ?? 0),
      total: (preSchedule.total ?? 0) - (preSchedule.total ?? 0),
      giveAmount: preSchedule.giveAmount ?? 0,
      calcInterest: BigNumber(preSchedule.storedInterest ?? 0)
        .plus(preSchedule.interestEve ?? 0)
        .plus(preSchedule.interestNonce ?? 0)
        .minus(preSchedule.didStoredInterest ?? 0)
        .minus(preSchedule.didInterestEve ?? 0)
        .minus(preSchedule.didInterestNonce ?? 0)
        .toNumber(),
      closeAmount: BigNumber(preSchedule.didBalance ?? 0)
        .plus(preSchedule.total)
        .minus(preSchedule.didTotal ?? 0)
        .toNumber(),
      preSchedule,
      skippedSchedules
    };
  }

  result.unUsedBalance = preSchedule.unUsedBalance;
  result.insurance =
    (preSchedule.insurance ?? 0) - (preSchedule.didInsurance ?? 0);
  result.debt = (preSchedule.debt ?? 0) - (preSchedule.didDebt ?? 0);

  const interest = calcInterest({
    balance: preSchedule.didBalance || preSchedule.balance,
    interestRate: preSchedule.interestRate ?? contract.interestRate,
    dayOfMonth: diffDay,
    fixed: calculationFixed
  });

  const { diffEve } = getDatesDiffMonth(preSchedule.payDate, currentDate);

  const calcedInterestEve = calcInterest({
    balance: preSchedule.didBalance || preSchedule.balance,
    interestRate: preSchedule.interestRate ?? contract.interestRate,
    dayOfMonth: diffEve,
    fixed: calculationFixed
  });
  const calcedInterestNonce = new BigNumber(interest)
    .minus(calcedInterestEve)
    .dp(calculationFixed, BigNumber.ROUND_HALF_UP)
    .toNumber();

  const commitmentInterest = calcInterest({
    balance: preSchedule.unUsedBalance,
    interestRate: preSchedule.interestRate ?? contract.interestRate,
    dayOfMonth: diffDay,
    fixed: calculationFixed
  });

  result.interestEve = new BigNumber(preSchedule.interestEve ?? 0)
    .minus(preSchedule.didInterestEve ?? 0)
    .plus(calcedInterestEve)
    .toNumber();
  result.interestNonce = new BigNumber(preSchedule.interestNonce || 0)
    .minus(preSchedule.didInterestNonce ?? 0)
    .plus(calcedInterestNonce)
    .toNumber();
  result.storedInterest = new BigNumber(preSchedule.storedInterest || 0)
    .minus(preSchedule.didStoredInterest ?? 0)
    .toNumber();
  result.commitmentInterest = new BigNumber(preSchedule.commitmentInterest || 0)
    .plus(commitmentInterest)
    .toNumber();
  result.payment = new BigNumber(preSchedule.payment ?? 0)
    .minus(preSchedule.didPayment ?? 0)
    .plus(
      (Array.isArray(skippedSchedules) ? skippedSchedules : []).reduce(
        (sum, cur) => sum + (cur.payment ?? 0),
        0
      )
    )
    .toNumber();

  result.balance = new BigNumber(preSchedule.balance)
    .plus(preSchedule.payment ?? 0)
    .minus(result.payment)
    .toNumber();
  result.didBalance = new BigNumber(preSchedule.didBalance ?? 0).toNumber();

  result.loss = new BigNumber(preSchedule.loss ?? 0)
    .minus(preSchedule.didLoss ?? 0)
    .toNumber();
  let lossDiffDay = diffDay - (contract?.skipLossDay || 0);
  if (lossDiffDay > 0) {
    result.loss = new BigNumber(result.loss ?? 0)
      .plus(
        await calcLoss(
          contract,
          {
            balance: preSchedule.balance,
            interest: new BigNumber(preSchedule.interestEve ?? 0)
              .plus(preSchedule.interestEve ?? 0)
              .plus(preSchedule.storedInterest ?? 0)
              .toNumber(),
            payment: preSchedule.payment ?? 0
          },
          contract.lossPercent ?? 0,
          lossDiffDay
        )
      )
      .toNumber();
  }

  result.total = new BigNumber(result.payment)
    .plus(result.interestEve)
    .plus(result.interestNonce)
    .plus(result.storedInterest)
    .plus(result.insurance)
    .plus(result.debt)
    .plus(result.loss)
    .toNumber();

  const closeAmount = BigNumber(preSchedule.didBalance ?? preSchedule.balance)
    .plus(result.total)
    .toNumber();

  return {
    ...result,
    calcInterest: BigNumber(result.storedInterest)
      .plus(result.interestEve)
      .plus(result.interestNonce)
      .toNumber(),
    closeAmount,
    preSchedule,
    skippedSchedules
  };
};

const getFreezeAmount = async (
  firstPayAmount,
  didPayment,
  preBalance,
  interestRate,
  diffDay,
  calculationFixed
) => {
  let nowBalance = preBalance - didPayment;

  const interest = calcInterest({
    balance: nowBalance,
    interestRate,
    dayOfMonth: diffDay,
    fixed: calculationFixed
  });

  const diff = new BigNumber(interest)
    .plus(didPayment)
    .minus(firstPayAmount)
    .dp(calculationFixed, BigNumber.ROUND_HALF_UP)
    .toNumber();

  if (diff > 0) {
    return await getFreezeAmount(
      firstPayAmount,
      didPayment - diff,
      preBalance,
      interestRate,
      diffDay,
      calculationFixed
    );
  }

  return interest;
};

const fixFutureSchedulesNext = async (
  LoanSchedules,
  contract,
  currentSchedule,
  futureSchedules,
  currentDate,
  diffPayment,
  calculationFixed
) => {
  let indBalance = currentSchedule.didBalance ?? 0;

  for (const afterCurrentSchedule of futureSchedules) {
    if (diffPayment <= 0) {
      break;
    }
    const diffDay = getDiffDay(currentDate, afterCurrentSchedule.payDate);

    const interest = calcInterest({
      balance: indBalance,
      interestRate: afterCurrentSchedule.interestRate ?? contract.interestRate,
      dayOfMonth: diffDay,
      fixed: calculationFixed
    });

    const { diffEve } = getDatesDiffMonth(
      currentDate,
      afterCurrentSchedule.payDate
    );

    const calcedInterestEve = calcInterest({
      balance: indBalance,
      interestRate: afterCurrentSchedule.interestRate ?? contract.interestRate,
      dayOfMonth: diffEve,
      fixed: calculationFixed
    });

    const calcedInterestNonce = new BigNumber(interest)
      .minus(calcedInterestEve)
      .dp(calculationFixed, BigNumber.ROUND_HALF_UP)
      .toNumber();
    let currPayment = 0;
    if (diffPayment < (afterCurrentSchedule.payment ?? 0)) {
      currPayment = (afterCurrentSchedule.payment ?? 0) - diffPayment;
    }

    indBalance = indBalance - currPayment;

    await LoanSchedules.updateOne(
      { _id: afterCurrentSchedule._id },
      {
        $set: {
          interestEve: calcedInterestEve,
          interestNonce: calcedInterestNonce,
          payment: currPayment,
          balance: indBalance,
          total: calcedInterestEve + calcedInterestNonce + currPayment
        }
      }
    );

    diffPayment = diffPayment - (afterCurrentSchedule.payment ?? 0);
  }
};

const fixFutureSchedulesLast = async (
  LoanSchedules,
  contract,
  currentSchedule,
  futureSchedules,
  currentDate,
  diffPayment,
  calculationFixed
) => {
  let loopBeforeSchedule = currentSchedule;

  for (const futureSch of futureSchedules) {
    const betweenDay = getDiffDay(
      loopBeforeSchedule.payDate,
      futureSch.payDate
    );

    const commitmentInterest = calcInterest({
      balance: loopBeforeSchedule.unUsedBalance || 0,
      interestRate: loopBeforeSchedule.interestRate ?? contract.interestRate,
      dayOfMonth: betweenDay,
      fixed: calculationFixed
    });

    const interest = calcInterest({
      balance: loopBeforeSchedule.didBalance || loopBeforeSchedule.balance,
      interestRate: loopBeforeSchedule.interestRate ?? contract.interestRate,
      dayOfMonth: betweenDay,
      fixed: calculationFixed
    });

    const { diffEve } = getDatesDiffMonth(
      loopBeforeSchedule.payDate,
      currentDate
    );

    const calcedInterestEve = calcInterest({
      balance: loopBeforeSchedule.didBalance || loopBeforeSchedule.balance,
      interestRate: loopBeforeSchedule.interestRate ?? contract.interestRate,
      dayOfMonth: diffEve,
      fixed: calculationFixed
    });

    const calcedInterestNonce = new BigNumber(interest)
      .minus(calcedInterestEve)
      .dp(calculationFixed, BigNumber.ROUND_HALF_UP)
      .toNumber();

    let payment = 0;
    let total = 0;

    if (contract.repayment === 'fixed') {
      total = futureSch.total;
      payment = total - interest - futureSch.insurance;
    } else {
      payment = futureSch.payment;
      total = payment + interest + futureSch.insurance;
    }

    if (loopBeforeSchedule.balance > payment) {
      payment = loopBeforeSchedule.balance;
      total = payment + interest + futureSch.insurance;
    }

    await LoanSchedules.updateOne(
      { _id: futureSch._id },
      {
        $set: {
          loss: 0,
          interestEve: calcedInterestEve,
          interestNonce: calcedInterestNonce,
          storedInterest: 0,
          commitmentInterest,
          payment,
          total
        }
      }
    );

    loopBeforeSchedule = await LoanSchedules.findOne({
      _id: futureSch._id
    });
  }
};

const fixFutureSchedulesImpact = async (
  LoanSchedules,
  contract,
  currentSchedule,
  futureSchedules,
  currentDate,
  diffPayment,
  calculationFixed
) => {
  if (contract.overPaymentIsNext) {
    await fixFutureSchedulesNext(
      LoanSchedules,
      contract,
      currentSchedule,
      futureSchedules,
      currentDate,
      diffPayment,
      calculationFixed
    );
  } else {
    await fixFutureSchedulesLast(
      LoanSchedules,
      contract,
      currentSchedule,
      futureSchedules,
      currentDate,
      diffPayment,
      calculationFixed
    );
  }
};

const overPaymentFutureImpact = async (
  LoanSchedules,
  contract,
  didPayment,
  amountInfos,
  trPayDate,
  currentDate,
  currentSchedule,
  preSchedule,
  calculationFixed
) => {
  let futureSchedules = await LoanSchedules.find(
    {
      contractId: contract._id,
      payDate: { $gt: getFullDate(trPayDate) }
    },
    { sort: { payDate: -1, createdAt: -1 } }
  );

  let diffPayment = didPayment - amountInfos.payment;

  if (futureSchedules.length) {
    // ireeduin huvaari baigaa buguud ene udaagiinh ni huvaariin bus udur bol daraagiin huvaariin huug nuushluh
    if (!currentSchedule.isDefault) {
      const nextSchedule = futureSchedules[0];
      const nextDiffDay = getDiffDay(trPayDate, nextSchedule.payDate);
      const freezeNextScheduleInterest = await getFreezeAmount(
        didPayment,
        didPayment,
        preSchedule.didBalance,
        preSchedule.interestRate ?? contract.interestRate,
        nextDiffDay,
        calculationFixed
      );

      // daraa sard nuutsulj bui huu ni tulsun - tuluh yostoi yalgavraas ih baival l nuutsluy
      if (freezeNextScheduleInterest < diffPayment) {
        await LoanSchedules.updateOne(
          { _id: currentSchedule._id },
          {
            $set: {
              freezeAmount: freezeNextScheduleInterest,
              didPayment:
                (currentSchedule.didPayment ?? 0) - freezeNextScheduleInterest,
              didBalance:
                (currentSchedule.didBalance ?? 0) + freezeNextScheduleInterest
            }
          }
        );

        const interest = calcInterest({
          balance: preSchedule.didBalance || preSchedule.balance,
          interestRate: preSchedule.interestRate ?? contract.interestRate,
          dayOfMonth: nextDiffDay,
          fixed: calculationFixed
        });

        const { diffEve } = getDatesDiffMonth(preSchedule.payDate, currentDate);

        const calcedInterestEve = calcInterest({
          balance: preSchedule.didBalance || preSchedule.balance,
          interestRate: preSchedule.interestRate ?? contract.interestRate,
          dayOfMonth: diffEve,
          fixed: calculationFixed
        });

        const calcedInterestNonce = new BigNumber(interest)
          .minus(calcedInterestEve)
          .dp(calculationFixed, BigNumber.ROUND_HALF_UP)
          .toNumber();

        await LoanSchedules.updateOne(
          { _id: nextSchedule._id },
          {
            $set: {
              payment: 0,
              balance:
                (currentSchedule.didBalance ?? 0) + freezeNextScheduleInterest,
              interestEve: calcedInterestEve,
              interestNonce: calcedInterestNonce
            }
          }
        );

        currentSchedule = await LoanSchedules.findOne({
          _id: nextSchedule
        });
        futureSchedules = futureSchedules.filter(
          (fs) => fs._id !== nextSchedule._id
        );
        currentDate = getFullDate(nextSchedule.payDate);
      }
    }

    await fixFutureSchedulesImpact(
      LoanSchedules,
      contract,
      currentSchedule,
      futureSchedules,
      currentDate,
      diffPayment,
      calculationFixed
    );
  } else {
    await LoanSchedules.updateMany(
      { _id: currentSchedule._id },
      { $set: { surplus: diffPayment } }
    );
  }
};

const afterPayTrInSchedule = async (LoanSchedules, foundCT, tr) => {
  let currentDate = getFullDate(tr.payDate);

  const calculationFixed = 2;

  const amountInfos = await getCalcedAmountsOnDate(
    LoanSchedules,
    foundCT,
    currentDate,
    calculationFixed
  );

  const { preSchedule, skippedSchedules } = amountInfos;

  if (!preSchedule) {
    return;
  }

  let surplus = 0;
  const didInfo = getAmountByPriority(tr.total, { ...amountInfos });

  const {
    didDebt,
    didLoss,
    didStoredInterest,
    didInterestEve,
    didInterestNonce,
    didInsurance,
    didPayment
  } = didInfo;
  let status = didInfo.status;

  // payment iig tulvul balance uldeh yostoi baidgaas undeslev
  let didBalance = (preSchedule.didBalance ?? 0) - didPayment;
  if (didBalance <= 0) {
    status = 'complete';
    surplus = didBalance * -1;
    didBalance = 0;
  }

  let currentSchedule = !getDiffDay(preSchedule?.payDate, currentDate)
    ? preSchedule
    : Array.isArray(skippedSchedules)
      ? skippedSchedules.find((ss) => !getDiffDay(ss.payDate, currentDate))
      : undefined;

  if (currentSchedule) {
    await LoanSchedules.updateOne(
      {
        _id: currentSchedule._id
      },
      {
        $set: {
          status,
          didDebt,
          didLoss,
          didStoredInterest,
          didInterestEve,
          didInterestNonce,
          didInsurance,
          didPayment,
          didBalance,
          didTotal: tr.total,
          surplus
        },
        $addToSet: { transactionIds: tr._id }
      }
    );
    currentSchedule = await LoanSchedules.findOne({
      _id: currentSchedule._id
    });
  } else {
    currentSchedule = await LoanSchedules.insertOne({
      _id: nanoid(),
      contractId: foundCT._id,
      status,
      isDefault: false,
      payDate: getFullDate(tr.payDate),
      interestRate: preSchedule.interestRate,

      balance: amountInfos.balance,
      unUsedBalance: amountInfos.unUsedBalance,

      loss: amountInfos.loss,
      interestEve: amountInfos.interestEve,
      interestNonce: amountInfos.interestNonce,
      storedInterest: amountInfos.storedInterest,
      commitmentInterest: amountInfos.commitmentInterest,
      payment: amountInfos.payment,
      insurance: amountInfos.insurance,
      debt: amountInfos.debt,
      total: amountInfos.total,

      didDebt,
      didLoss,
      didStoredInterest,
      didInterestEve,
      didInterestNonce,
      didInsurance,
      didPayment,
      didBalance,
      didTotal: tr.total,
      surplus,
      transactionIds: [tr._id]
    });
  }

  const updStatusSchedules = skippedSchedules?.filter((ss) =>
    getDiffDay(ss.payDate, currentDate)
  );
  if (updStatusSchedules?.length) {
    await LoanSchedules.updateMany(
      { _id: { $in: updStatusSchedules.map((u) => u._id) } },
      { $set: { status: 'skipped' } }
    );
  }

  if (amountInfos.payment < didPayment) {
    await overPaymentFutureImpact(
      LoanSchedules,
      foundCT,
      didPayment,
      amountInfos,
      getFullDate(tr.payDate),
      currentDate,
      currentSchedule,
      preSchedule,
      calculationFixed
    );
  }
};

const getCorrectDate = (genDate, holidayType, weekends, perHolidays) => {
  if (!['before', 'after'].includes(holidayType)) {
    return genDate;
  }

  const month = genDate.getMonth();
  const day = genDate.getDate();

  if (
    weekends.includes(genDate.getDay()) ||
    perHolidays.find((ph) => ph.month === month + 1 && ph.day === day)
  ) {
    let multiplier = 1;
    if (holidayType === 'before') {
      multiplier = -1;
    }
    return getCorrectDate(
      new Date(moment(genDate).add(multiplier, 'day').format('YYYY-MM-DD')),
      holidayType,
      weekends,
      perHolidays
    );
  } else {
    return genDate;
  }
};

const generateDates = (
  startDate,
  scheduleDays,
  tenor,
  holidayType,
  weekends,
  perHolidays,
  firstPayDate
) => {
  let mainDate;
  var dateRanges = [];

  // ehnii tuluh udur todorhoi bol ter uduriig ni dates-d oroltsuulna harin todorhoigui bol startDate ees hoishhi anh oldson huvaarit udruur todorhoilogdono
  if (firstPayDate) {
    mainDate = getFullDate(firstPayDate);
    dateRanges.push(mainDate);
  } else {
    mainDate = getFullDate(startDate);
  }

  const dateRange = scheduleDays.sort((a, b) => a - b);

  for (let index = 0; index < tenor + 2; index++) {
    const year = moment(mainDate).year();
    const month = moment(mainDate).month();

    for (const subDay of dateRange) {
      const genDate = getFullDate(new Date(year, month, subDay));

      if (dateRanges.includes(genDate) || mainDate > genDate) {
        continue;
      }

      const correctDate = getCorrectDate(
        genDate,
        holidayType,
        weekends,
        perHolidays
      );

      if (!dateRanges.includes(correctDate)) {
        dateRanges.push(correctDate);
      }
    }

    mainDate = new Date(
      moment(new Date(year, month, 1))
        .add(1, 'M')
        .format('YYYY-MM-DD')
    );
  }

  return dateRanges;
};

const addMonths = (date, months) => {
  return new Date(moment(new Date(date)).add(months, 'M').format('YYYY-MM-DD'));
};

const getSkipDate = (currentDate, skipMonth, skipDay) => {
  if (skipDay) {
    return new Date(
      moment(new Date(currentDate)).add(skipDay, 'day').format('YYYY-MM-DD')
    );
  }
  if (skipMonth) {
    return new Date(
      moment(new Date(currentDate)).add(skipMonth, 'M').format('YYYY-MM-DD')
    );
  }
  return;
};

const calcPerMonthEqual = async ({
  currentDate,
  balance,
  interestRate,
  payment,
  nextDate,
  calculationFixed,
  unUsedBalance,
  skipInterestCalcDate,
  skipAmountCalcDate
}) => {
  // Хүү тооцохгүй огнооноос урагш бол үндсэн төлөлт л хийхнь
  if (skipInterestCalcDate && getDiffDay(nextDate, skipInterestCalcDate) >= 0) {
    // Үндсэн төлөлт ч хийхгүй хүү ч тооцохгүй бол юу ч төлөхгүй
    if (skipAmountCalcDate && getDiffDay(nextDate, skipAmountCalcDate) >= 0) {
      return {
        date: nextDate,
        interestRate: 0,
        loanBalance: balance,
        calcedInterestEve: 0,
        calcedInterestNonce: 0,
        unUsedBalance,
        commitmentInterest: 0,
        totalPayment: 0
      };
    }
    const loanBalance = new BigNumber(balance)
      .minus(payment)
      .dp(calculationFixed, BigNumber.ROUND_HALF_UP)
      .toNumber();
    const totalPayment = payment;

    return {
      date: nextDate,
      interestRate: 0,
      loanBalance,
      calcedInterestEve: 0,
      calcedInterestNonce: 0,
      unUsedBalance,
      commitmentInterest: 0,
      totalPayment
    };
  }

  const diffDay = getDiffDay(currentDate, nextDate);

  const interest = calcInterest({
    balance,
    interestRate: interestRate,
    dayOfMonth: diffDay,
    fixed: calculationFixed
  });

  const { diffEve } = getDatesDiffMonth(currentDate, nextDate);

  const calcedInterestEve = calcInterest({
    balance,
    interestRate: interestRate,
    dayOfMonth: diffEve,
    fixed: calculationFixed
  });

  const calcedInterestNonce = new BigNumber(interest)
    .minus(calcedInterestEve)
    .dp(calculationFixed, BigNumber.ROUND_HALF_UP)
    .toNumber();
  const commitmentInterest = calcInterest({
    balance: unUsedBalance || 0,
    interestRate: interestRate,
    dayOfMonth: diffDay,
    fixed: calculationFixed
  });

  // Үндсэн төлөлт л хийхгүй бол хүү тооцож тооцсон хүүгээ л төлнө
  if (skipAmountCalcDate && getDiffDay(nextDate, skipAmountCalcDate) >= 0) {
    return {
      date: nextDate,
      interestRate,
      loanBalance: balance,
      calcedInterestEve,
      calcedInterestNonce,
      unUsedBalance,
      commitmentInterest,
      totalPayment: interest
    };
  }

  const loanBalance = new BigNumber(balance)
    .minus(payment)
    .dp(calculationFixed, BigNumber.ROUND_HALF_UP)
    .toNumber();

  const totalPayment = new BigNumber(payment)
    .plus(calcedInterestEve)
    .plus(calcedInterestNonce)
    .toNumber();

  return {
    date: nextDate,
    interestRate,
    loanBalance,
    calcedInterestEve,
    calcedInterestNonce,
    unUsedBalance,
    commitmentInterest,
    totalPayment
  };
};

const getEqualPay = async ({
  startDate,
  interestRate,
  leaseAmount,
  paymentDates,
  calculationFixed
}) => {
  if (!leaseAmount) {
    return 0;
  }

  let currentDate = getFullDate(moment(startDate).add(-1, 'day').toDate());
  let mainRatio = new BigNumber(0);
  let ratio = 1;
  for (let i = 0; i < paymentDates.length; i++) {
    let nextDay = paymentDates[i];
    const dayOfMonth = getDiffDay(currentDate, nextDay);
    let ratioDivider = new BigNumber(dayOfMonth)
      .multipliedBy(new BigNumber(interestRate).dividedBy(100))
      .dividedBy(365)
      .plus(1);
    const newRatio = new BigNumber(ratio).dividedBy(ratioDivider).toNumber();
    mainRatio = mainRatio.plus(newRatio);
    currentDate = getFullDate(nextDay);
    ratio = newRatio;
  }

  return new BigNumber(leaseAmount)
    .div(mainRatio)
    .dp(calculationFixed, BigNumber.ROUND_HALF_UP)
    .toNumber();
};

const calcAllMonthLast = async ({
  currentDate,
  balance,
  interestRate,
  endDate,
  calculationFixed,
  unUsedBalance
}) => {
  const diffDay = getDiffDay(currentDate, endDate);
  const interest = calcInterest({
    balance,
    interestRate: interestRate,
    dayOfMonth: diffDay,
    fixed: calculationFixed
  });

  const { diffEve } = getDatesDiffMonth(currentDate, endDate);
  const calcedInterestEve = calcInterest({
    balance,
    interestRate: interestRate,
    dayOfMonth: diffEve,
    fixed: calculationFixed
  });

  const calcedInterestNonce = new BigNumber(interest)
    .minus(calcedInterestEve)
    .dp(calculationFixed, BigNumber.ROUND_HALF_UP)
    .toNumber();

  const commitmentInterest = calcInterest({
    balance: unUsedBalance ?? 0,
    interestRate: interestRate,
    dayOfMonth: diffDay,
    fixed: calculationFixed
  });

  return {
    interestRate,
    interest,
    calcedInterestEve,
    calcedInterestNonce,
    unUsedBalance,
    commitmentInterest
  };
};

const calcPerMonthFixed = async ({
  currentDate,
  balance,
  interestRate,
  total,
  nextDate,
  calculationFixed,
  unUsedBalance,
  skipInterestCalcDate,
  skipAmountCalcDate
}) => {
  // Хүү тооцохгүй огнооноос урагш бол
  if (skipInterestCalcDate && getDiffDay(nextDate, skipInterestCalcDate) >= 0) {
    // Үндсэн төлөлт ч хийхгүй хүү ч тооцохгүй бол
    if (skipAmountCalcDate && getDiffDay(nextDate, skipAmountCalcDate) >= 0) {
      return {
        date: nextDate,
        interestRate: 0,
        loanBalance: balance,
        loanPayment: 0,
        calcedInterestEve: 0,
        calcedInterestNonce: 0,
        unUsedBalance,
        commitmentInterest: 0
      };
    }
    const loanPayment = total;
    const loanBalance = new BigNumber(balance)
      .minus(loanPayment)
      .dp(2, BigNumber.ROUND_HALF_UP)
      .toNumber();

    return {
      date: nextDate,
      interestRate: 0,
      loanBalance,
      loanPayment,
      calcedInterestEve: 0,
      calcedInterestNonce: 0,
      unUsedBalance,
      commitmentInterest: 0
    };
  }

  const diffDay = getDiffDay(currentDate, nextDate);
  const interest = calcInterest({
    balance,
    interestRate: interestRate,
    dayOfMonth: diffDay,
    fixed: calculationFixed
  });

  const { diffEve } = getDatesDiffMonth(currentDate, nextDate);
  const calcedInterestEve = calcInterest({
    balance,
    interestRate: interestRate,
    dayOfMonth: diffEve,
    fixed: calculationFixed
  });

  const calcedInterestNonce = new BigNumber(interest)
    .minus(calcedInterestEve)
    .dp(calculationFixed, BigNumber.ROUND_HALF_UP)
    .toNumber();

  const commitmentInterest = calcInterest({
    balance: unUsedBalance ?? 0,
    interestRate: interestRate,
    dayOfMonth: diffDay,
    fixed: calculationFixed
  });

  // Үндсэн төлөлт л хийхгүй бол хүү тооцож тооцсон хүүгээ л төлнө
  if (skipAmountCalcDate && getDiffDay(nextDate, skipAmountCalcDate) >= 0) {
    return {
      date: nextDate,
      interestRate: 0,
      loanBalance: balance,
      loanPayment: 0,
      calcedInterestEve,
      calcedInterestNonce,
      unUsedBalance,
      commitmentInterest
    };
  }

  const loanPayment = new BigNumber(total)
    .minus(calcedInterestEve)
    .minus(calcedInterestNonce)
    .toNumber();
  const loanBalance = new BigNumber(balance)
    .minus(loanPayment)
    .dp(calculationFixed, BigNumber.ROUND_HALF_UP)
    .toNumber();

  return {
    date: nextDate,
    interestRate,
    loanBalance,
    loanPayment,
    calcedInterestEve,
    calcedInterestNonce,
    unUsedBalance,
    commitmentInterest
  };
};

const scheduleHelper = async (
  bulkEntries,
  {
    _id,
    contractId,
    repayment,
    startDate,
    balance,
    interestRate,
    tenor,
    salvageAmount,
    unUsedBalance,
    skipInterestCalcMonth,
    skipInterestCalcDay,
    skipAmountCalcMonth,
    skipAmountCalcDay,
    dateRanges
  },
  calculationFixed = 2
) => {
  if (tenor === 0) {
    return bulkEntries;
  }
  let currentDate = getFullDate(startDate);

  let endDate = addMonths(new Date(startDate), tenor);

  const paymentDates = dateRanges.filter((date) => {
    if (date <= startDate || date > endDate) return false;
    return true;
  });

  const skipInterestCalcDate = getSkipDate(
    currentDate,
    skipInterestCalcMonth,
    skipInterestCalcDay
  );
  const skipAmountCalcDate = getSkipDate(
    currentDate,
    skipAmountCalcMonth,
    skipAmountCalcDay
  );

  switch (repayment) {
    case 'equal':
      const payment = new BigNumber(balance - (salvageAmount || 0))
        .div(paymentDates.length)
        .dp(calculationFixed, BigNumber.ROUND_HALF_UP)
        .toNumber();

      for (const payDate of paymentDates) {
        const perMonth = await calcPerMonthEqual({
          currentDate,
          balance,
          interestRate: interestRate ?? 0,
          payment,
          nextDate: payDate,
          calculationFixed,
          unUsedBalance,
          skipInterestCalcDate,
          skipAmountCalcDate
        });

        currentDate = perMonth.date;
        balance = perMonth.loanBalance;

        bulkEntries.push({
          _id: nanoid(),
          createdAt: new Date(),
          contractId,
          version: '0',
          payDate: currentDate,
          interestRate: perMonth.interestRate ?? 0,
          balance: balance,
          payment,
          firstPayment: payment,
          interestEve: perMonth.calcedInterestEve,
          interestNonce: perMonth.calcedInterestNonce,
          total: perMonth.totalPayment,
          unUsedBalance,
          commitmentInterest: perMonth.commitmentInterest,
          isDefault: true
        });
      }

      break;

    case 'last': {
      const calcedOne = await calcAllMonthLast({
        currentDate,
        balance,
        interestRate,
        endDate,
        calculationFixed,
        unUsedBalance
      });

      const totalAmount = balance + calcedOne.interest;

      bulkEntries = [
        {
          _id: nanoid(),
          createdAt: new Date(),
          contractId,
          version: '0',
          payDate: endDate,
          interestRate: calcedOne.interestRate,
          balance: 0,
          payment: balance,

          interestEve: calcedOne.calcedInterestEve,
          interestNonce: calcedOne.calcedInterestNonce,
          total: totalAmount,
          unUsedBalance: calcedOne.unUsedBalance,
          commitmentInterest: calcedOne.commitmentInterest,
          isDefault: true,
          firstTotal: totalAmount
        }
      ];
      balance = 0;
      currentDate = endDate;

      break;
    }

    // case 'fixed':
    default: {
      let total = await getEqualPay({
        startDate,
        interestRate: interestRate ?? 0,
        leaseAmount: balance,
        paymentDates,
        calculationFixed
      });

      for (const payDate of paymentDates) {
        const perMonth = await calcPerMonthFixed({
          currentDate,
          balance,
          interestRate: interestRate ?? 0,
          total,
          nextDate: payDate,
          calculationFixed,
          unUsedBalance,
          skipInterestCalcDate,
          skipAmountCalcDate
        });

        currentDate = perMonth.date;
        balance = perMonth.loanBalance;

        bulkEntries.push({
          _id: nanoid(),
          createdAt: new Date(),
          contractId,
          version: '0',
          payDate: currentDate,
          interestRate: perMonth.interestRate,
          balance,
          payment: perMonth.loanPayment,
          interestEve: perMonth.calcedInterestEve,
          interestNonce: perMonth.calcedInterestNonce,
          total,
          firstTotal: total,
          unUsedBalance,
          commitmentInterest: perMonth.commitmentInterest,
          isDefault: true
        });
      }

      break;
    }
  }

  const lastEntry = bulkEntries[bulkEntries.length - 1];
  if (lastEntry) {
    const tempBalance = balance - (salvageAmount || 0);
    lastEntry.total = lastEntry.total + tempBalance;
    lastEntry.balance = salvageAmount || 0;
    lastEntry.payment = lastEntry.payment + tempBalance;
    bulkEntries[bulkEntries.length - 1] = lastEntry;
  }

  return bulkEntries;
};

const fixFutureSchedulesGive = async (
  LoanSchedules,
  contract,
  currentSchedule,
  futureSchedules
) => {
  const dateRanges = futureSchedules.map((fsh) => fsh.payDate);

  const unUsedBalance = currentSchedule.unUsedBalance;
  contract.stepRules?.filter((sr) => sr.firstPayDate > currentSchedule.payDate);

  let bulkEntries = [];
  let balance = currentSchedule.didBalance || currentSchedule.balance;
  let startDate = getFullDate(currentSchedule.payDate);
  let tenor = futureSchedules.length;

  if (contract.stepRules?.length) {
    for (const stepRule of contract.stepRules.sort(
      (a, b) => a.firstPayDate.getTime() - b.firstPayDate.getTime()
    )) {
      if (!stepRule.salvageAmount) {
        if (stepRule.totalMainAmount) {
          stepRule.salvageAmount = balance - stepRule.totalMainAmount;
        }

        if (stepRule.mainPayPerMonth) {
          stepRule.salvageAmount =
            balance - stepRule.mainPayPerMonth * stepRule.tenor;
        }
      }

      bulkEntries = await scheduleHelper(
        bulkEntries,
        {
          _id: nanoid(),
          contractId: contract._id,
          repayment: contract.repayment,
          startDate,
          balance,
          interestRate: stepRule.interestRate ?? contract.interestRate,
          tenor: stepRule.tenor,
          salvageAmount: stepRule.salvageAmount || 0,
          unUsedBalance: unUsedBalance || 0,
          skipInterestCalcMonth: stepRule.skipInterestCalcMonth,
          skipInterestCalcDay: stepRule.skipInterestCalcDay,
          skipAmountCalcMonth: stepRule.skipAmountCalcMonth,
          skipAmountCalcDay: stepRule.skipAmountCalcDay,
          dateRanges
        },
        2
      );

      if (bulkEntries.length) {
        const preEntry = bulkEntries[bulkEntries.length - 1];
        startDate = preEntry.payDate;
        balance = preEntry.balance;
      }
      tenor = tenor - stepRule.tenor;
    }
  }

  if (tenor > 0) {
    bulkEntries = await scheduleHelper(
      bulkEntries,
      {
        _id: nanoid(),
        contractId: contract._id,
        repayment: contract.repayment,
        startDate,
        balance,
        interestRate: contract.interestRate,
        tenor,
        salvageAmount: 0,
        unUsedBalance,
        skipInterestCalcMonth:
          (!bulkEntries.length && contract.skipInterestCalcMonth) || undefined,
        skipInterestCalcDay:
          (!bulkEntries.length && contract.skipInterestCalcDay) || undefined,
        skipAmountCalcMonth:
          (!bulkEntries.length && contract.skipAmountCalcMonth) || undefined,
        skipAmountCalcDay:
          (!bulkEntries.length && contract.skipAmountCalcDay) || undefined,
        dateRanges
      },
      2
    );
  }

  return bulkEntries;
};

const generateSchedules = async (LoanSchedules, contract, unUsedBalance) => {
  let bulkEntries = [];
  let balance = contract.leaseAmount;
  let startDate = getFullDate(contract.startDate);
  let tenor = contract.tenor;

  const perHolidays = [];

  if (contract.stepRules?.length) {
    for (const stepRule of contract.stepRules.sort(
      (a, b) => a.firstPayDate.getTime() - b.firstPayDate.getTime()
    )) {
      if (!stepRule.salvageAmount) {
        if (stepRule.totalMainAmount) {
          stepRule.salvageAmount = balance - stepRule.totalMainAmount;
        }

        if (stepRule.mainPayPerMonth) {
          stepRule.salvageAmount =
            balance - stepRule.mainPayPerMonth * stepRule.tenor;
        }
      }

      const dateRanges = generateDates(
        startDate,
        stepRule.scheduleDays || contract.scheduleDays,
        tenor,
        contract.holidayType || 'exact',
        contract.weekends || [],
        perHolidays,
        stepRule.firstPayDate
      );

      bulkEntries = await scheduleHelper(
        bulkEntries,
        {
          _id: nanoid(),
          contractId: contract._id,
          repayment: contract.repayment,
          startDate,
          balance,
          interestRate: stepRule.interestRate ?? contract.interestRate,
          tenor: stepRule.tenor,
          salvageAmount: stepRule.salvageAmount || 0,
          unUsedBalance: unUsedBalance || 0,
          skipInterestCalcMonth: stepRule.skipInterestCalcMonth,
          skipInterestCalcDay: stepRule.skipInterestCalcDay,
          skipAmountCalcMonth: stepRule.skipAmountCalcMonth,
          skipAmountCalcDay: stepRule.skipAmountCalcDay,
          dateRanges
        },
        2
      );

      if (bulkEntries.length) {
        const preEntry = bulkEntries[bulkEntries.length - 1];
        startDate = preEntry.payDate;
        balance = preEntry.balance;
      }
      tenor = tenor - stepRule.tenor;
    }
  }

  if (tenor > 0) {
    const dateRanges = generateDates(
      startDate,
      contract.scheduleDays,
      tenor,
      contract.holidayType || 'exact',
      contract.weekends || [],
      perHolidays,
      (bulkEntries.length && contract.firstPayDate) || undefined
    );

    bulkEntries = await scheduleHelper(
      bulkEntries,
      {
        _id: nanoid(),
        contractId: contract._id,
        repayment: contract.repayment,
        startDate,
        balance,
        interestRate: contract.interestRate,
        tenor,
        salvageAmount: 0,
        unUsedBalance,
        skipInterestCalcMonth:
          (!bulkEntries.length && contract.skipInterestCalcMonth) || undefined,
        skipInterestCalcDay:
          (!bulkEntries.length && contract.skipInterestCalcDay) || undefined,
        skipAmountCalcMonth:
          (!bulkEntries.length && contract.skipAmountCalcMonth) || undefined,
        skipAmountCalcDay:
          (!bulkEntries.length && contract.skipAmountCalcDay) || undefined,
        dateRanges
      },
      2
    );
  }

  return bulkEntries;
};

const firstGiveTr = async (LoanSchedules, foundCT, tr) => {
  const unUsedBalance = new BigNumber(foundCT.leaseAmount)
    .minus(tr.total)
    .toNumber();
  await LoanSchedules.insertOne({
    _id: nanoid(),
    contractId: foundCT._id,
    status: 'give',
    payDate: getFullDate(tr.payDate),
    balance: new BigNumber(tr.total || 0).toNumber(),
    didBalance: new BigNumber(tr.total || 0).toNumber(),
    unUsedBalance,
    interestEve: 0,
    interestNonce: 0,
    storedInterest: 0,
    commitmentInterest: 0,
    loss: 0,
    payment: 0,
    transactionIds: [tr._id],
    total: 0,
    giveAmount: tr.total
  });

  foundCT.leaseAmount = tr.total;
  foundCT.startDate = getFullDate(tr.payDate);
  const bulkEntries = await generateSchedules(
    LoanSchedules,
    foundCT,
    unUsedBalance
  );

  await LoanSchedules.insertMany(
    bulkEntries.map((b) => ({ ...b, isDefault: true, unUsedBalance }))
  );
};

const afterGiveTrInSchedule = async (LoanSchedules, foundCT, tr) => {
  const calculationFixed = 2;
  const alreadySchedules = await LoanSchedules.findOne({
    contractId: foundCT._id
  });

  if (!alreadySchedules?._id) {
    await firstGiveTr(LoanSchedules, foundCT, tr);
    return;
  }

  const amounts = await getCalcedAmountsOnDate(
    LoanSchedules,
    foundCT,
    tr.payDate,
    calculationFixed
  );

  let unUsedBalance = new BigNumber(amounts.unUsedBalance)
    .minus(tr.total)
    .toNumber();
  if (unUsedBalance < 0) {
    // hetrelt baij bolzoshgui shalgah
    unUsedBalance = 0;
  }

  const currentSchedule = await LoanSchedules.insertOne({
    _id: nanoid(),
    contractId: foundCT._id,
    status: 'give',
    payDate: getFullDate(tr.payDate),
    balance: new BigNumber(tr.total || 0).plus(amounts.balance).toNumber(),
    didBalance: new BigNumber(tr.total || 0)
      .plus(amounts.didBalance)
      .toNumber(),
    unUsedBalance,
    interestEve: amounts.interestEve ?? 0,
    interestNonce: amounts.interestNonce ?? 0,
    storedInterest: amounts.storedInterest ?? 0,
    commitmentInterest: amounts.commitmentInterest ?? 0,
    insurance: amounts.insurance ?? 0,
    debt: amounts.debt ?? 0,
    payment: amounts.payment ?? 0,
    transactionIds: [tr._id],
    total: 0,
    giveAmount: tr.total
  });

  const futureSchedules = await LoanSchedules.find(
    {
      contractId: foundCT._id,
      payDate: { $gt: getFullDate(currentSchedule.payDate) }
    },
    { sort: { payDate: -1, createdAt: -1 } }
  );

  const bulkEntries = await fixFutureSchedulesGive(
    LoanSchedules,
    foundCT,
    currentSchedule,
    futureSchedules
  );
  const updateBulkOps = [];

  let index = 0;
  for (const futureSch of futureSchedules) {
    const updInfos = bulkEntries[index];
    updateBulkOps.push({
      updateOne: {
        filter: { _id: futureSch._id },
        update: { $set: { ...updInfos } },
        upsert: true
      }
    });

    index++;
  }

  await LoanSchedules.bulkWrite(updateBulkOps);
};

const syncCollateral = async (
  ProductCategories,
  Products,
  collaterals,
  document
) => {
  if (collaterals.length > 0) {
    document.collateralsData = [];

    for (const item of collaterals) {
      const detailCollateral = await fetchPolaris('13610906', [item.acntCode]);

      const product = await Products.findOne({
        code: item.acntCode
      });

      if (!product) {
        let categoryId;
        const findCategory = await ProductCategories.findOne({
          code: detailCollateral.acntCode
        });

        if (findCategory) {
          categoryId = findCategory._id;
        } else {
          const createCategory = await ProductCategories.insertOne({
            _id: nanoid(),
            name: `${item.acntName} ${item.linkTypeName}`,
            code: detailCollateral.acntCode,
            order: `${detailCollateral.acntCode}/`,
            status: 'active',
            createdAt: new Date()
          });

          categoryId = createCategory.insertedId;
        }

        const createProduct = await Products.insertOne({
          _id: nanoid(),
          name: `${item.acntName} ${item.linkTypeName}`,
          code: item.acntCode,
          unitPrice: detailCollateral.price,
          categoryId,
          createdAt: new Date()
        });

        document.collateralsData.push({
          _id: nanoid(),
          collateralId: createProduct.insertedId,
          cost: detailCollateral.price,
          percent: 0,
          marginAmount: 0,
          leaseAmount: item.useAmount,
          currency: item.useCurCode,
          certificate: detailCollateral.key2,
          vinNumber: detailCollateral.key
        });
      } else {
        // Optional: If you want to handle case when product exists
        document.collateralsData.push({
          _id: nanoid(),
          collateralId: product._id,
          cost: detailCollateral.useAmount,
          percent: 0,
          marginAmount: 0,
          leaseAmount: item.useAmount,
          currency: item.useCurCode,
          certificate: detailCollateral.key2,
          vinNumber: detailCollateral.key
        });
      }
    }
  }

  return document;
};

const syncSchedules = async (
  LoanFirstSchedules,
  LoanContracts,
  pLoanSchedules,
  loanContract
) => {
  if (pLoanSchedules.length > 0) {
    const schedules = pLoanSchedules.map((schedule) => ({
      _id: nanoid(),
      contractId: loanContract.insertedId.toString(),
      status: 'pending',
      payDate: new Date(schedule.schdDate),
      balance: schedule.totalAmount,
      interestNonce: schedule.intAmount,
      payment: schedule.totalAmount,
      total: schedule.totalAmount
    }));

    await LoanFirstSchedules.insertMany(schedules);

    await LoanContracts.updateOne(
      { _id: loanContract.insertedId },
      {
        $set: {
          firstPayDate: new Date(pLoanSchedules[0].schdDate),
          scheduleDays: [await getMostFrequentPaymentDay(pLoanSchedules)]
        }
      }
    );
  }
};

const syncTransactions = async (
  huulga,
  aprvAmnt,
  LoanTransaction,
  LoanSchedules,
  LoanContracts,
  loanContract
) => {
  const filteredIncomeTxns = await dateGroup(huulga, aprvAmnt);

  for (const data of filteredIncomeTxns) {
    const foundCT = await LoanContracts.findOne({
      _id: loanContract.insertedId
    });

    if (data.outcome === aprvAmnt || data.balance === aprvAmnt) {
      const doc = {
        _id: nanoid(),
        transactionType: 'give',
        contractId: loanContract.insertedId,
        payDate: new Date(data.postDate),
        total: data.outcome,
        pendings: [],
        reactions: [],
        currency: data.curCode,
        isManual: true,
        createdAt: new Date()
      };

      const transaction = await LoanTransaction.insertOne({ ...doc });

      const tr = await LoanTransaction.findOne({
        _id: transaction.insertedId
      });

      afterGiveTrInSchedule(LoanSchedules, foundCT, tr);
    } else {
      const doc = {
        _id: nanoid(),
        contractId: loanContract.insertedId,
        payDate: new Date(data.postDate),
        description: data.txnDesc,
        currency: data.curCode,
        payment: data.income,
        transactionType: 'repayment',
        calcInterest: 0,
        storedInterest: 0,
        commitmentInterest: 0,
        loss: 0,
        total: data.income,
        isManual: true,
        createdAt: new Date()
      };

      const transaction = await LoanTransaction.insertOne({ ...doc });

      const tr = await LoanTransaction.findOne({
        _id: transaction.insertedId
      });

      afterPayTrInSchedule(LoanSchedules, foundCT, tr);
    }
  }
};
