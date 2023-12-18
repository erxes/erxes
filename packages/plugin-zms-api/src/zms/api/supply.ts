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
    const validdatorResult = await zmsListValidator(
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
      const result = await supplyRequest(header, xml);
      // create zms Logs
      return await createLogs(beforeData, preDatas, result);
    }
    async function prepareDatas(prepareDatas) {
      for await (const prepareData of prepareDatas) {
        await setAction(prepareData);
      }
      return prepareDatas;
    }
    async function setAction(data) {
      const regnum = data.customer.o_c_customer_information.o_c_registerno;
      let customerAction = 'add';
      let loanAction = 'add';
      //find zms
      const customerZms = await getZms(regnum);
      if (customerZms.length > 0) {
        customerAction = 'update';
        const loans = data.customer.o_c_onus_information;
        if (!!loans.o_c_loanline) {
          let loanLine = loans.o_c_loanline;
          for await (const loan of loanLine) {
            loanAction = await getAction(
              regnum,
              loan.o_c_loanline_advamount,
              loan.o_c_loanline_starteddate
            );
            //set Action
            await prepareAction(data, customerAction, loanAction);
          }
        } else if (!!loans.o_c_loanmrtnos) {
          let loanmrtnos = loans.o_c_loanmrtnos;
          for await (const loan of loanmrtnos) {
            loanAction = await getAction(
              regnum,
              loan.o_c_loan_balance,
              loan.o_c_loan_starteddate
            );
            //set Action
            await prepareAction(data, customerAction, loanAction);
          }
        } else if (!!loans.o_c_leasing) {
          let loanLeasing = loans.o_c_loanmrtnos;
          for await (const loan of loanLeasing) {
            loanAction = await getAction(
              regnum,
              loan.o_c_leasing_advamount,
              loan.o_c_leasing_starteddate
            );
            //set Action
            await prepareAction(data, customerAction, loanAction);
          }
        } else if (!!loans.o_c_accredit) {
          let loanCredit = loans.o_c_accredit;
          for await (const loan of loanCredit) {
            loanAction = await getAction(
              regnum,
              loan.o_c_accredit_advamount,
              loan.o_c_accredit_starteddate
            );
            //set Action
            await prepareAction(data, customerAction, loanAction);
          }
        }
      } else {
        await prepareAction(data, loanAction, customerAction);
      }
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
  return await Zmss.find(query).lean();
}
async function getAction(regum, loanAmount, startDate) {
  let action = 'add';
  const zmss = await getZms(regum);
  if (zmss.length > 0) {
    for await (const zms of zmss) {
      if (zms.customer.o_c_onus_information) {
        action = await getLoanAction(
          zms.customer.o_c_onus_information,
          loanAmount,
          startDate
        );
      }
    }
  }
  return action;
}
async function getLoanAction(loans, amount, startDate) {
  let loanAction = 'add';
  if (!!loans.o_c_loanline) {
    loans.o_c_loanline.filter(async el => {
      loanAction =
        el.o_c_loanline_advamount === amount &&
        formatDate(el.o_c_loanline_starteddate) === startDate
          ? 'update'
          : 'add';
    });
  } else if (!!loans.o_c_loanmrtnos) {
    loans.o_c_loanmrtnos.filter(async el => {
      loanAction =
        el.o_c_loan_balance === amount &&
        formatDate(el.o_c_loan_starteddate) === startDate
          ? 'update'
          : 'add';
    });
  } else if (!!loans.o_c_leasing) {
    loans.o_c_leasing.filter(async el => {
      loanAction =
        el.o_c_leasing_advamount === amount &&
        formatDate(el.o_c_leasing_starteddate) === startDate
          ? 'update'
          : 'add';
    });
  } else if (!!loans.o_c_accredit) {
    loans.o_c_accredit.filter(async el => {
      loanAction =
        el.o_c_accredit_advamount === amount &&
        formatDate(el.o_c_accredit_starteddate) === startDate
          ? 'update'
          : 'add';
    });
  }
  return loanAction;
}
async function prepareAction(dataAction, customAction, loanAction) {
  for await (const field of changeActionFields) {
    if (field.type === 'object') {
      const result = await getProp(dataAction, field.path, '');
      if (Array.isArray(result)) {
        for await (const el of result) {
          field.group === 'loan'
            ? (el.$ = { action: loanAction })
            : (el.$ = { action: customAction });
        }
      } else {
        field.group === 'loan'
          ? (result.$ = { action: loanAction })
          : (result.$ = { action: customAction });
      }
    } else if (field.type === 'string') {
      const str = await getPropStr(dataAction, field.path, '');
      field.group === 'loan'
        ? (str.object[str.path] = {
            $: { action: loanAction },
            _: str.defaultVal
          })
        : (str.object[str.path] = {
            $: { action: customAction },
            _: str.defaultVal
          });
    }
  }
  return dataAction;
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
      return JSON.stringify(response.data);
    })
    .catch(error => {
      console.log(error);
    });
}
async function createLogs(beforeDatas, sentDatas, result) {
  for await (const beforeData of beforeDatas) {
    const regnum = beforeData.customer.o_c_customer_information.o_c_registerno;
    const zms = await getZms(regnum);
    if (zms.length > 0) {
      beforeData.customer.action = 'update';
      beforeData.customer.o_c_customer_information.action = 'update';
      beforeData.customer.o_c_mortgage_information.o_c_mortgage.action =
        'update';
      const loans = beforeData.customer.o_c_onus_information;
      for await (const loan of loans) {
        await loanCheck(loan, zms);
      }
    } else {
      //const customer = beforeData.filter( data => data.customer.o_c_customer_information.o_c_registerno === regnum)
      beforeData.customer.action = 'add';
      beforeData.customer.o_c_customer_information.action = 'add';
      beforeData.customer.o_c_mortgage_information.o_c_mortgage.action = 'add';
      const loans = beforeData.customer.o_c_onus_information;
      loans.action = 'add';
      await addAction(loans);
      //await Zmss.insertMany(beforeData);
    }
  }
  // ZmsLogs.create({
  //   createdAt: new Date(),
  //   ipAddress: '123.12.12.12',
  //   zmsId: zms._id,
  //   action: 'update',
  //   object: zms,
  //   status: sentDatas,
  //   sentDate: new Date(),
  //   sentBy: 'miiga',
  //   response: result
  // });
  //if()
  //insert update
  //const zmsResult = await Zmss.insertMany(datas);
  // for await (const zms of zmsResult) {
  //   ZmsLogs.create({
  //     createdAt: new Date(),
  //     ipAddress: '123.12.12.12',
  //     zmsId: zms._id,
  //     action: 'update',
  //     object: zms,
  //     status: true,
  //     sentDate: new Date(),
  //     sentBy: 'miiga',
  //     response: result
  //   });
  // }
  return result;
}
async function loanCheck(loans, zms) {
  for await (const loan of loans) {
    if (loans.o_c_loanline) {
      for await (const loan of loans.o_c_loanline) {
        loan.action = 'add';
      }
    }

    if (loans.o_c_loanmrtnos) {
      for await (const loan of loans.o_c_loanmrtnos) {
        loan.action = 'add';
      }
    }

    if (loans.o_c_leasing) {
      for await (const loan of loans.o_c_leasing) {
        loan.action = 'add';
      }
    }

    if (loans.o_c_accredit) {
      for await (const loan of loans.o_c_accredit) {
        loan.action = 'add';
      }
    }
    return loans;
  }
}
async function addAction(loans) {
  if (loans.o_c_loanline) {
    for await (const loan of loans.o_c_loanline) {
      loan.action = 'add';
    }
  }

  if (loans.o_c_loanmrtnos) {
    for await (const loan of loans.o_c_loanmrtnos) {
      loan.action = 'add';
    }
  }

  if (loans.o_c_leasing) {
    for await (const loan of loans.o_c_leasing) {
      loan.action = 'add';
    }
  }

  if (loans.o_c_accredit) {
    for await (const loan of loans.o_c_accredit) {
      loan.action = 'add';
    }
  }
  return loans;
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
  const json = parseString(xml, { explicitArray: false }, function(
    error,
    result
  ) {});
  return json;
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
    path: ['customer', 'o_c_mortgage_information', 'o_c_mortgage'],
    type: 'object',
    group: 'mortgage'
  }
];
