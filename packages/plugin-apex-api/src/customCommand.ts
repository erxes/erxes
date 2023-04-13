import * as dotenv from 'dotenv';
import { init } from '@erxes/api-utils/src/messageBroker';
import { redis } from '@erxes/api-utils/src/serviceDiscovery';
import { initBroker } from './messageBroker';
import { ISendMessageArgs, sendMessage } from '@erxes/api-utils/src/core';
import * as fs from 'fs';
import { Writable } from 'stream';
import csvParser = require('csv-parser');
import {
  getService,
  getServices,
  isAvailable,
  isEnabled
} from '@erxes/api-utils/src/serviceDiscovery';

let messageBrokerClient;

const serviceDiscovery = {
  getServices,
  getService,
  isAvailable,
  isEnabled
};

const bankField = process.env.bankField;
const bankAccountNameField = process.env.bankAccountNameField;
const bankAccountNoField = process.env.bankAccountNoField;
const addressField = process.env.addressField;
const customerTypeField = process.env.customerTypeField;
const registerNumberField = process.env.registerNumberField;
const professionField = process.env.professionField;
const clientPortalId = process.env.clientPortalId;

const sendCommonMessage = async (
  args: ISendMessageArgs & { serviceName: string }
): Promise<any> => {
  return sendMessage({
    serviceDiscovery,
    client: messageBrokerClient,
    ...args
  });
};

const importBulkStream = ({
  filePath,
  bulkLimit
}: {
  filePath: string;
  bulkLimit: number;
}) => {
  return new Promise(async (resolve, reject) => {
    let rows: any = [];
    let readSteam;
    let rowIndex = 0;

    readSteam = fs.createReadStream(filePath);

    const write = (row, _, next) => {
      rows.push(row);

      if (rows.length === bulkLimit) {
        rowIndex++;

        return handleBulkOperation(filePath, rowIndex, rows)
          .then(() => {
            rows = [];
            next();
          })
          .catch(e => {
            console.log(`Error during bulk insert from csv: ${e.message}`);
            reject(e);
          });
      }

      return next();
    };

    readSteam
      .pipe(csvParser())
      .pipe(new Writable({ write, objectMode: true }))
      .on('finish', () => {
        rowIndex++;
        console.log('finish', rows.length, rowIndex);
        handleBulkOperation(filePath, rowIndex, rows).then(() => {
          resolve('success');
        });
      })
      .on('error', e => reject(e));
  });
};

const importUsers = async (rows: any[]) => {
  const customerOperations: any = [];
  const clientPortalUserOperations: any = [];

  for (const row of rows) {
    const [
      email,
      register_number,
      parent_register_number,
      passport,
      family,
      first_name,
      last_name,
      mobile_number,
      address,
      work_addr,
      work_phone,
      country_name,
      country_code,
      account_number,
      broker_code,
      mit_prefix,
      suffix // TTOL-B/2411199-LI/0
    ] = row;

    if (!email || !register_number || !suffix) {
      continue;
    }

    const [s1, s2, s3] = suffix.split('-');
    const [p1, p2] = s3.split('/');

    let customerType;

    if (p1 === 'LI') {
      customerType = 1;
    }

    if (p1 === 'FI') {
      customerType = 2;
    }

    if (p1 === 'LC' || p2 === 'FC') {
      customerType = 3;
    }

    if (p1 === 'JR') {
      customerType = 4;
    }

    customerOperations.push({
      selector: { primaryEmail: email },
      doc: {
        state: 'customer',
        primaryEmail: email,
        primaryPhone: mobile_number,
        emails: [email],
        phones: [mobile_number],
        code: register_number,
        firstName: first_name,
        lastName: last_name,
        status: 'Active',
        emailValidationStatus: 'valid',
        phoneValidationStatus: 'valid'
      },
      customFieldsData: [
        {
          field: registerNumberField,
          value: register_number,
          stringValue: register_number
        },
        {
          field: addressField,
          value: address,
          stringValue: address
        },
        {
          field: professionField,
          value: 'employee',
          stringValue: 'employee'
        },
        {
          field: customerTypeField,
          value: customerType,
          stringValue: customerType,
          numberValue: customerType
        }
      ]
    });

    clientPortalUserOperations.push({
      selector: { email },
      doc: {
        email,
        phone: mobile_number,
        firstName: first_name,
        lastName: last_name,
        clientPortalId
      }
    });
  }

  await sendCommonMessage({
    subdomain: 'os',
    serviceName: 'contacts',
    action: 'customers.createOrUpdate',
    isRPC: true,
    data: { rows: customerOperations, doNotReplaceExistingValues: true }
  });

  await sendCommonMessage({
    subdomain: 'os',
    serviceName: 'clientportal',
    action: 'clientPortalUsers.createOrUpdate',
    isRPC: true,
    data: { rows: clientPortalUserOperations }
  });
};

const importBankInfo = async (rows: any[]) => {
  const customerOperations: any[] = [];

  for (const row of rows) {
    const [
      register_number,
      mit_prefix,
      bank_name,
      bank_code,
      account_name,
      account_number,
      account_type
    ] = row;

    if (!register_number) {
      continue;
    }

    customerOperations.push({
      selector: { code: register_number },
      doc: {},
      customFieldsData: [
        {
          field: bankField,
          value: bank_name,
          stringValue: bank_name
        },
        {
          field: bankAccountNameField,
          value: account_name,
          stringValue: account_name
        },
        {
          field: bankAccountNoField,
          value: account_number,
          stringValue: account_number
        }
      ]
    });
  }

  await sendCommonMessage({
    subdomain: 'os',
    serviceName: 'contacts',
    action: 'customers.createOrUpdate',
    isRPC: true,
    data: { rows: customerOperations, doNotReplaceExistingValues: true }
  });
};

const handleBulkOperation = async (
  filePath: string,
  rowIndex: number,
  rows: any
) => {
  let parsedRows: any = [];

  for (const row of rows) {
    parsedRows.push(Object.values(row));
  }

  try {
    if (filePath.includes('users.csv')) {
      await importUsers(parsedRows);
    } else {
      await importBankInfo(parsedRows);
    }
  } catch (e) {
    console.log(`Error during line ${rowIndex}`, e.message);
  }
};

dotenv.config();

const command = async () => {
  const [_a1, _a2, filePath] = process.argv;

  const { RABBITMQ_HOST, MESSAGE_BROKER_PREFIX } = process.env;

  messageBrokerClient = await init({
    RABBITMQ_HOST,
    MESSAGE_BROKER_PREFIX,
    redis
  });

  initBroker(messageBrokerClient);

  await importBulkStream({ filePath, bulkLimit: 100 });

  console.log(`Process finished at: ${new Date()}`);

  process.exit();
};

command();
