import { BaseApi } from './base';
import { Builder, parseString } from 'xml2js';
import {
  zmsListValidator,
  validationFields
} from '../../models/util/xmlZmsUtil';
import { ZmsLogs, Zmss } from '../../models';
export class SupplyApi extends BaseApi {
  async checkSupply(sendDatas) {
    //check zms data
    const validdatorResult = zmsListValidator(
      sendDatas.customers,
      validationFields,
      []
    );
    if (validdatorResult.length) {
      return validdatorResult;
    } else {
      // to prepare action
      const beforeData = JSON.parse(JSON.stringify(sendDatas.customers));
      const preDatas = await prepareDatas(sendDatas.customers);
      // to prepare xml
      const xml = await toXML(sendDatas);
      // to prepare header supply
      const header = await this.getHeaders();
      header['Content-Type'] = 'application/xml';
      // send supply
      const supplyResult = await supplyRequest(header, xml);
      // create zms Logs
      const results = await toJson(supplyResult);
      await addActionTobeforeDatas(beforeData);
      return await saveLogs(beforeData, preDatas, results);
    }
    async function prepareDatas(prepareDatas) {
      for await (const prepareData of prepareDatas) {
        await setAction(prepareData);
      }
      return prepareDatas;
    }
    async function setAction(data) {
      const regnum = data.customer.o_c_customer_information.o_c_registerno;
      const customerAction = await getCustomerAction(regnum);
      customerAction === 'update'
        ? await findloanAction(data, regnum, customerAction)
        : await setActionOtherField(data, 'add', 'add');
      return data;
    }
    //Convert string/JSON to XML
    async function toXML(json: any) {
      const builder = await new Builder();
      const xml = await builder.buildObject(json);
      return xml;
    }
  }
}
async function getZms(regum) {
  const query: any = {
    'customer.o_c_customer_information.o_c_registerno': regum
  };
  return await Zmss.findOne(query);
}

async function findloanAction(data, regnum, customerAction) {
  const loans = data.customer.o_c_onus_information;
  const type = 'send';
  if (loans.o_c_loanline) {
    await findActionLoanLines(data, loans.o_c_loanline, regnum, type);
  }
  if (loans.o_c_loanmrtnos) {
    await findActionLoanmrtnos(data, loans.o_c_loanmrtnos, regnum, type);
  }
  if (loans.o_c_leasing) {
    await findActionleasing(data, loans.o_c_leasing, regnum, type);
  }
  if (loans.o_c_accredit) {
    await findActionAccredit(data, loans.o_c_accredit, regnum, type);
  }
  await setActionOtherField(data, customerAction, customerAction);
}
async function setActionOtherField(preData, customAction, loanAction) {
  for await (const field of changeActionFields) {
    field.type === 'object'
      ? await setObjectAction(preData, field, customAction, loanAction)
      : await setStrtAction(preData, field, customAction, loanAction);
  }
  return preData;
}
async function setObjectAction(preData, field, customAction, loanAction) {
  const result = await getProp(preData, field.path, '');
  if (Array.isArray(result)) {
    await setActionWithArray(result, field, customAction, loanAction);
  } else {
    await setActionWithStr(result, field, customAction, loanAction);
  }
}
async function setActionWithArray(result, field, customAction, loanAction) {
  for await (const el of result) {
    if (field.group === 'loan') {
      el.$ = { action: loanAction };
    } else {
      el.$ = { action: customAction };
    }
  }
  return result;
}
async function setActionWithStr(result, field, customAction, loanAction) {
  if (field.group === 'loan') {
    result.$ = { action: loanAction };
  } else {
    result.$ = { action: customAction };
  }
  return result;
}
async function setStrtAction(preData, field, customAction, loanAction) {
  const str = await getPropStr(preData, field.path, '');
  if (field.group === 'loan') {
    str.object[str.path] = {
      $: { action: loanAction },
      _: str.defaultVal
    };
  } else {
    str.object[str.path] = {
      $: { action: customAction },
      _: str.defaultVal
    };
  }
}
async function getProp(object, path, defaultVal) {
  const _path = Array.isArray(path)
    ? [...path]
    : path.split('.').filter(i => i.length);
  if (!_path.length) {
    return (await object) === undefined ? { defaultVal } : object;
  }
  return await getProp(object[_path.shift()], _path, defaultVal);
}
async function getPropStr(object, path, defaultVal) {
  const _path = Array.isArray(path)
    ? [...path]
    : path.split('.').filter(i => i.length);
  if (_path.length === 1) {
    return { object, path: path[0], defaultVal: object[_path.shift()] };
  }
  return await getPropStr(object[_path.shift()], _path, defaultVal);
}
async function supplyRequest(header, xml) {
  const axios = require('axios');
  let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: 'https://staging-supply.burenscore.mn/api/v1/supply',
    headers: header,
    data: xml
  };
  return await axios
    .request(config)
    .then(response => {
      return response.data;
    })
    .catch(error => {
      console.log(error);
    });
}
async function addActionTobeforeDatas(beforeDatas) {
  for await (const data of beforeDatas) {
    const regnum = data.customer.o_c_customer_information.o_c_registerno;
    const customerAction = await getCustomerAction(regnum);
    await setActionLog(data, customerAction);
  }
  return beforeDatas;
}

async function saveLogs(beforeDatas, sentDatas, results) {
  for await (const result of results.response.customer) {
    const data = await beforeDatas.find(
      beforeDate =>
        beforeDate.customer.o_c_customer_information.o_c_customercode ===
        result.customercode
    );
    const sentData = await sentDatas.find(
      sentData =>
        sentData.customer.o_c_customer_information.o_c_customercode ===
        result.customercode
    );
    const customerAction = await getCustomerAction(
      data.customer.o_c_customer_information.o_c_registerno
    );
    await saveZms(customerAction, data, result, sentData);
  }
  return results;
}
function padTwoDigits(num: number) {
  return num.toString().padStart(2, '0');
}
function formatDate(date: Date, dateDiveder: string = '-') {
  return (
    [
      date.getFullYear(),
      padTwoDigits(date.getMonth() + 1),
      padTwoDigits(date.getDate())
    ].join(dateDiveder) +
    ' ' +
    [
      padTwoDigits(date.getHours()),
      padTwoDigits(date.getMinutes()),
      padTwoDigits(date.getSeconds())
    ].join(':')
  );
}
async function toJson(xml: string) {
  return new Promise(resolveOuter => {
    return parseString(xml, { explicitArray: false }, (_, result) => {
      resolveOuter(result);
    });
  });
}

async function saveZms(action, data, result, sentData) {
  if (action === 'add') {
    data.customer.response = result.result;
    await Zmss.insertMany(data);
    await createLogs(data, sentData, result);
  } else if (action === 'update') {
    data.customer.response = result.result;
    const regnum = data.customer.o_c_customer_information.o_c_registerno;
    const loans = data.customer.o_c_onus_information;
    await preNewLoans(loans, regnum);
    await createLogs(data, action, result);
  }
  return data;
}
async function createLogs(data, sentData, result) {
  const regnum = data.customer.o_c_customer_information.o_c_registerno;
  const zms = await getZms(regnum);
  await ZmsLogs.insertMany({
    createdAt: new Date(),
    zmsId: zms._id,
    action: data?.customer.action,
    sentData: JSON.stringify(sentData),
    status: result.result,
    sendData: data,
    sentDate: new Date(),
    sentBy: '', //request
    response: JSON.stringify(result)
  });
}
async function getCustomerAction(regrum) {
  const zms = await getZms(regrum);
  return zms ? 'update' : 'add';
}
async function findActionLoanLines(data, loanLines, regrum, type) {
  const zms = await getZms(regrum);
  if (zms.customer.o_c_onus_information.o_c_loanline) {
    const zmsLoans = zms.customer.o_c_onus_information.o_c_loanline;
    for await (const loan of loanLines) {
      const loanAction = await getActionLoanLine(
        zmsLoans,
        loan.o_c_loanline_advamount,
        loan.o_c_loanline_starteddate
      );
      await setActionLoan(loanAction, loan, type);
    }
  }
  return data;
}
async function getActionLoanLine(zmsLoans, amount, starteddate) {
  const loan = zmsLoans.find(
    loan =>
      loan.o_c_loanline_advamount === amount &&
      formatDate(loan.o_c_loanline_starteddate) === starteddate
  );
  const loanAction = loan ? 'update' : 'add';
  return loanAction;
}
async function findActionLoanmrtnos(data, loanmrtnos, regrum, type) {
  const zms = await getZms(regrum);
  if (zms.customer.o_c_onus_information.o_c_loanmrtnos) {
    const zmsLoans = zms.customer.o_c_onus_information.o_c_loanmrtnos;
    for await (const loan of loanmrtnos) {
      const loanAction = await getActionLoanmrtnos(
        zmsLoans,
        loan.o_c_loan_advamount,
        loan.o_c_loan_starteddate
      );
      await setActionLoan(loanAction, loan, type);
    }
  }
  return data;
}
async function getActionLoanmrtnos(zmsLoans, amount, starteddate) {
  const loanAction =
    zmsLoans.filter(
      loan =>
        loan.o_c_loan_advamount === amount &&
        formatDate(loan.o_c_loan_starteddate) == starteddate
    ).length > 0
      ? 'update'
      : 'add';
  return loanAction;
}
async function findActionleasing(data, leasing, regrum, type) {
  const zms = await getZms(regrum);
  if (zms.customer.o_c_onus_information.o_c_leasing) {
    const zmsLoans = zms.customer.o_c_onus_information.o_c_leasing;
    for await (const loan of leasing) {
      const loanAction = await getActionleasing(
        zmsLoans,
        loan.o_c_leasing_advamount,
        loan.o_c_leasing_starteddate
      );
      await setActionLoan(loanAction, loan, type);
    }
  }
  return data;
}
async function getActionleasing(zmsLoans, amount, starteddate) {
  const loanAction = zmsLoans.filter(
    loan =>
      loan.o_c_leasing_advamount === amount &&
      formatDate(loan.o_c_leasing_starteddate) == starteddate
  );
  if (loanAction.length > 0) {
    return 'update';
  }
  return 'add';
}
async function findActionAccredit(data, accredits, regrum, type) {
  const zms = await getZms(regrum);
  if (zms.customer.o_c_onus_information.o_c_accredit) {
    const zmsLoans = zms.customer.o_c_onus_information.o_c_accredit;
    for await (const loan of accredits) {
      const loanAction = await getActionlAccredit(
        zmsLoans,
        loan.o_c_accredit_advamount,
        loan.o_c_accredit_starteddate
      );
      await setActionLoan(loanAction, loan, type);
    }
  }
  return data;
}
async function getActionlAccredit(zmsLoans, amount, starteddate) {
  const loanAction = zmsLoans.filter(
    loan =>
      loan.o_c_accredit_advamount === amount &&
      formatDate(loan.o_c_accredit_starteddate) == starteddate
  );
  if (loanAction.length > 0) {
    return 'Update';
  }
  return 'add';
}
async function setActionLoan(loanAction, loan, type) {
  if (type === 'send') {
    loan.$ = { action: loanAction };
  } else {
    loan.action = loanAction;
  }
  return loan;
}
async function setActionLog(data, action) {
  for await (const field of changeActionFields) {
    if (field.type === 'object') {
      const result = await getProp(data, field.path, '');
      if (Array.isArray(result)) {
        for await (const el of result) {
          el.action = action;
        }
      } else {
        result.action = action;
      }
    }
  }
  return data;
}
const changeActionFields: any = [
  {
    path: ['customer'],
    type: 'object',
    group: 'customer'
  },
  {
    path: ['customer', 'o_c_customer_information'],
    type: 'object',
    group: 'customer'
  },
  {
    path: [
      'customer',
      'o_c_customer_information',
      'o_c_customer_bankrelations'
    ],
    type: 'string',
    group: 'customer'
  },
  {
    path: ['customer', 'o_c_onus_information'],
    type: 'object',
    group: 'loan'
  },
  {
    path: ['customer', 'o_c_onus_information', 'o_c_loanline'],
    type: 'object',
    group: 'loan'
  },
  {
    path: ['customer', 'o_c_onus_information', 'o_c_accredit'],
    type: 'object',
    group: 'loan'
  },
  {
    path: ['customer', 'o_c_onus_information', 'o_c_leasing'],
    type: 'object',
    group: 'loan'
  },
  {
    path: ['customer', 'o_c_onus_information', 'o_c_loanrelnos'],
    type: 'object',
    group: 'loan'
  },
  {
    path: ['customer', 'o_c_mortgage_information', 'o_c_mortgage'],
    type: 'object',
    group: 'mortgage'
  }
];
async function preNewLoans(loans, regnum) {
  const zms = await getZms(regnum);
  for (const loan in loans) {
    await preLoan(loan, loans, regnum);
  }
  return zms;
}

async function preLoan(loan, loans, regnum) {
  if (loan === 'o_c_loanline') {
    const insertLoans = loans.o_c_loanline.filter(
      lline => lline.action === 'add'
    );
    if (insertLoans.length > 0) {
      Zmss.updateOne(
        { 'customer.o_c_customer_information.o_c_registerno': regnum },
        {
          $push: {
            'customer.o_c_onus_information.o_c_loanline': {
              $each: insertLoans
            }
          }
        }
      );
    }
  } else if (loan === 'o_c_loanmrtnos') {
    const insertLoans = loans.o_c_loanmrtnos.filter(
      loanmrtnos => loanmrtnos.action === 'add'
    );
    if (insertLoans.length > 0) {
      Zmss.updateOne(
        { 'customer.o_c_customer_information.o_c_registerno': regnum },
        {
          $push: {
            'customer.o_c_onus_information.o_c_loanmrtnos': {
              $each: insertLoans
            }
          }
        }
      );
    }
  } else if (loan === 'o_c_leasing') {
    const insertLoans = loans.o_c_leasing.filter(
      leasing => leasing.action === 'add'
    );
    if (insertLoans.length > 0) {
      Zmss.updateOne(
        { 'customer.o_c_customer_information.o_c_registerno': regnum },
        {
          $push: {
            'customer.o_c_onus_information.o_c_leasing': {
              $each: insertLoans
            }
          }
        }
      );
    }
  } else if (loan === 'o_c_accredit') {
    const insertLoans = loans.o_c_accredit.filter(
      accredit => accredit.action === 'add'
    );
    if (insertLoans.length > 0) {
      Zmss.updateOne(
        { 'customer.o_c_customer_information.o_c_registerno': regnum },
        {
          $push: {
            'customer.o_c_onus_information.o_c_accredit': {
              $each: insertLoans
            }
          }
        }
      );
    }
    Zmss.updateOne(
      { 'customer.o_c_customer_information.o_c_registerno': regnum },
      {
        $push: {
          'customer.o_c_onus_information.o_c_accredit': { $each: insertLoans }
        }
      }
    );
  }
}
