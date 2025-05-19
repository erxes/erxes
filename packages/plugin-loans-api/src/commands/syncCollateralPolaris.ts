const moment = require('moment');
const http = require('http');
const BigNumber = require('bignumber.js');

const nanoid = (len = 21) => {
  const charSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

  let randomString = '';

  for (let i = 0; i < len; i++) {
    const position = Math.floor(Math.random() * charSet.length);
    randomString += charSet.substring(position, position + 1);
  }

  return randomString;
};

const dateGroup = async (data) => {
  if (!data || !Array.isArray(data.txns)) {
    throw new Error('Invalid input: data.txns must be an array');
  }

  // Step 1: Filter transactions with income !== 0
  const filtered = data.txns.filter((txn) => txn.income !== 0);

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

const getFullDate = (date: Date) => {
  return new Date(moment(date).format('YYYY-MM-DD'));
};

const getDiffDay = (fromDate: Date, toDate: Date) => {
  const date1 = getFullDate(fromDate);
  const date2 = getFullDate(toDate);
  return (date2.getTime() - date1.getTime()) / (1000 * 3600 * 24);
};

const getAmountByPriority = (
  total: number,
  params: {
    debt: number;
    loss: number;
    storedInterest: number;
    interestEve: number;
    interestNonce: number;
    insurance: number;
    payment: number;
  }
) => {
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
}: {
  balance: number;
  interestRate: number;
  fixed?: number;
  dayOfMonth?: number;
}): number => {
  const interest = new BigNumber(interestRate).div(100).div(365);
  return new BigNumber(balance)
    .multipliedBy(interest)
    .multipliedBy(dayOfMonth)
    .dp(fixed, BigNumber.ROUND_HALF_UP)
    .toNumber();
};

const calcLoss = async (
  contract: any,
  paymentInfo: any,
  lossPercent: number,
  diff: number
): Promise<number> => {
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

const getDaysInMonth = (date: Date) => {
  const ndate = getFullDate(date);
  const year = ndate.getFullYear();
  const month = ndate.getMonth() + 1;
  // Here January is 1 based
  //Day 0 is the last day in the previous month
  return new Date(year, month, 0).getDate();
  // Here January is 0 based
  // return new Date(year, month+1, 0).getDate();
};

const getDatesDiffMonth = (fromDate: Date, toDate: Date) => {
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
  console.log('1111111111');

  if (!calculationFixed) {
    calculationFixed = 2;
  }
  console.log('2222222222');
  const currentDate = getFullDate(date);
  const result: {
    balance: number;
    didBalance: number;
    unUsedBalance: number;

    loss: number;
    interestEve: number;
    interestNonce: number;
    storedInterest: number;
    commitmentInterest: number;
    payment: number;
    insurance: number;
    debt: number;
    total: number;
    giveAmount: number;
    calcInterest: number;
    closeAmount: number;
    preSchedule?: any;
    skippedSchedules?: any[];
  } = {
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
  console.log('33333333333333');
  const preSchedule = await LoanSchedules.findOne(
    {
      contractId: contract._id,
      payDate: { $lte: currentDate },
      didBalance: { $exists: true, $gte: 0 }
    },
    { sort: { payDate: -1, createdAt: -1 } }
  );

  console.log('44444444');

  console.log(preSchedule, 'preSchedule');

  if (!preSchedule) {
    return result;
  }

  const skippedSchedules = await LoanSchedules.find({
    contractId: contract._id,
    payDate: { $gt: preSchedule.payDate, $lte: currentDate }
  })
    .sort({ payDate: -1, createdAt: -1 })
    .lean();

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
      (skippedSchedules || []).reduce((sum, cur) => sum + (cur.payment ?? 0), 0)
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
    }).lean();
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
  let futureSchedules = await LoanSchedules.find({
    contractId: contract._id,
    payDate: { $gt: getFullDate(trPayDate) }
  })
    .sort({ payDate: 1, createdAt: 1 })
    .lean();

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
        }).lean();
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
    : skippedSchedules?.find((ss) => !getDiffDay(ss.payDate, currentDate));

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
    }).lean();
  } else {
    currentSchedule = await LoanSchedules.create({
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

export const syncCollateral = async (
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

export const syncSchedules = async (
  LoanFirstSchedules,
  LoanContracts,
  pLoanSchedules,
  loanContract
) => {
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
};

export const syncTransactions = async (
  huulga,
  LoanTransaction,
  LoanSchedules,
  LoanContracts,
  loanContract
) => {
  const filtered = await dateGroup(huulga);

  for (const data of filtered) {
    if (data.income !== 0) {
      const doc = {
        _id: nanoid(),
        contractId: loanContract,
        payDate: new Date(data.postDate),
        description: data.txnDesc,
        currency: data.curCode,
        payment: data.income,
        transactionType: 'repayment',
        calcInterest: 0,
        storedInterest: 0,
        commitmentInterest: 0,
        loss: 0,
        total: 0,
        isManual: true,
        createdAt: new Date()
      };

      const transaction = await LoanTransaction.insertOne({ ...doc });

      const tr = await LoanTransaction.findOne({
        _id: transaction.insertedId
      });

      const foundCT = await LoanContracts.findOne({
        _id: 'IFmfkRSuJXnNClNJlDwxI'
      });

      await afterPayTrInSchedule(LoanSchedules, foundCT, tr);
    }
  }
};
