import { BaseApi } from './base';
import { Builder } from 'xml2js';
import {
  zmsListValidator,
  validationFields
} from '../../models/util/xmlZmsUtil';
import { ZmsLogs, Zmss } from '../../models';
export class SupplyApi extends BaseApi {
  async checkSupply(zmslist) {
    //check zms data
    const valResult = await zmsListValidator(
      zmslist.customers,
      validationFields,
      []
    );

    if (valResult.length > 0) {
      return valResult;
    } else {
      // add action
      const customers = await setActionCustomer(zmslist.customers);

      // to prepare xml
      const preXml = await toXML(customers);
      // to prepare header supply
      const header = await this.getHeaders();
      header['Content-Type'] = 'application/xml';
      // send supply
      const result = await supplyRequest(header, preXml);
      // create zms && zmsLog
      return await saveZms(customers, result);
    }

    async function setActionCustomer(customers) {
      for await (const customer of customers) {
        await addAction(customer);
      }
      return customers;
    }
    async function addAction(customerData) {
      const regnum =
        customerData.customer.o_c_customer_information.o_c_registerno;
      // //find Action type
      const cusLoans = customerData.customer.o_c_onus_information;
      if (!!cusLoans.o_c_loanline) {
        let loanLine = cusLoans.o_c_loanline;
        for await (const loan of loanLine) {
          const actionType = await getAction(
            regnum,
            loan.o_c_loanline_advamount,
            loan.o_c_loanline_starteddate
          );
          //set Action
          await setAction(customerData, actionType);
        }
      } else if (!!cusLoans.o_c_loanmrtnos) {
        let loanmrtnos = cusLoans.o_c_loanmrtnos;
        for await (const loan of loanmrtnos) {
          const actionType = await getAction(
            regnum,
            loan.o_c_loan_balance,
            loan.o_c_loan_starteddate
          );
          //set Action
          await setAction(customerData, actionType);
        }
      } else if (!!cusLoans.o_c_leasing) {
        let loanLeasing = cusLoans.o_c_loanmrtnos;
        for await (const loan of loanLeasing) {
          const actionType = await getAction(
            regnum,
            loan.o_c_leasing_advamount,
            loan.o_c_leasing_starteddate
          );
          //set Action
          await setAction(customerData, actionType);
        }
      } else if (!!cusLoans.o_c_accredit) {
        let loanCredit = cusLoans.o_c_accredit;
        for await (const loan of loanCredit) {
          const actionType = await getAction(
            regnum,
            loan.o_c_accredit_advamount,
            loan.o_c_accredit_starteddate
          );
          //set Action
          await setAction(customerData, actionType);
        }
      }
      return customerData;
    }

    //Convert string/JSON to XML
    async function toXML(json: any) {
      const builder = await new Builder();
      const xml = await builder.buildObject(json);
      return xml;
    }
  }
}
const changeActionFields: any = [
  {
    path: ['customer'],
    type: 'object'
  },
  {
    path: ['customer', 'o_c_customer_information'],
    type: 'object'
  },
  {
    path: [
      'customer',
      'o_c_customer_information',
      'o_c_customer_bankrelations'
    ],
    type: 'string'
  },
  {
    path: ['customer', 'o_c_onus_information'],
    type: 'object'
  },
  {
    path: ['customer', 'o_c_onus_information', 'o_c_loanline'],
    type: 'object'
  },
  {
    path: ['customer', 'o_c_mortgage_information', 'o_c_mortgage'],
    type: 'object'
  }
];

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

async function getAction(regum, loanAmount, startDate) {
  let action = 'add';
  const query: any = {
    o_c_customer_information: { o_c_regnum: regum }
  };
  const customer = await getCustomer(query);
  if (customer) {
    if (customer.o_c_loan_information.length > 0) {
      customer.o_c_loan_information.filter(
        loan =>
          loan.o_c_loan_amount === loanAmount &&
          loan.o_c_loan_contract_date === startDate
      ).length > 0
        ? (action = 'update')
        : (action = 'add');
    }
  }
  return action;
}

async function getCustomer(query) {
  return await Zmss.findOne({ query });
}

async function setAction(customerData, action) {
  for await (const field of changeActionFields) {
    if (field.type === 'object') {
      const result = await getProp(customerData, field.path, '');
      if (Array.isArray(result)) {
        for await (const el of result) {
          el.$ = { action: action };
        }
      } else {
        result.$ = { action: action };
      }
    } else if (field.type === 'string') {
      const str = await getPropStr(customerData, field.path, '');
      str.object[str.path] = { $: { action: action }, _: str.defaultVal };
    }
  }
  return customerData;
}
async function saveZms(datas, result) {
  const zmsResult = await Zmss.insertMany(datas);
  for await (const zms of zmsResult) {
    ZmsLogs.create({
      createdAt: new Date(),
      ipAddress: '123.12.12.12',
      zmsId: zms._id,
      action: 'update',
      object: zms,
      status: true,
      sentDate: new Date(),
      sentBy: 'miiga',
      response: result
    });
  }
  return zmsResult;
}
