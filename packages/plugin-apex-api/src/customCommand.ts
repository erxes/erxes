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

const bankAccountNoField = '3WedBm5MhX4A3ctw8';
const addressField = 'tn9HoKuwwXDrf9zgm';
const clientPortalId =
  process.env.NODE_ENV === 'production'
    ? '5JNSjcL8eRuRuAxFK'
    : 'fEHX3LsHH6AsKxRCL';

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

const importUsers = async (row: any) => {
  const [
    email,
    register_number,
    parent_register_number,
    passport,
    family,
    first_name,
    last_name,
    mobile_number,
    address
  ] = row;

  if (!email || !register_number) {
    return;
  }

  let customer = await sendCommonMessage({
    subdomain: 'os',
    serviceName: 'contacts',
    action: 'customers.findOne',
    isRPC: true,
    data: {
      code: register_number
    }
  });

  const doc = {
    primaryEmail: email,
    primaryPhone: mobile_number,
    code: register_number,
    firstName: first_name,
    lastName: last_name,
    customFieldsData: [
      {
        field: addressField,
        value: address,
        stringValue: address
      }
    ]
  };

  if (customer) {
    await sendCommonMessage({
      subdomain: 'os',
      serviceName: 'contacts',
      action: 'customers.updateCustomer',
      isRPC: true,
      data: {
        _id: customer._id,
        doc
      }
    });
  } else {
    customer = await sendCommonMessage({
      subdomain: 'os',
      serviceName: 'contacts',
      action: 'customers.createCustomer',
      isRPC: true,
      data: {}
    });
  }

  const prevUser = await sendCommonMessage({
    subdomain: 'os',
    serviceName: 'clientportal',
    action: 'clientPortalUsers.findOne',
    isRPC: true,
    data: {
      email
    }
  });

  if (!prevUser) {
    await sendCommonMessage({
      subdomain: 'os',
      serviceName: 'clientportal',
      action: 'clientPortalUsers.create',
      isRPC: true,
      data: {
        password: 'Temp@123',
        clientPortalId,
        email,
        phone: mobile_number,
        firstName: first_name,
        lastName: last_name,
        erxesCustomerId: customer._id
      }
    });
  }
};

const importBankInfo = async (row: any) => {
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
    return;
  }

  const customer = await sendCommonMessage({
    subdomain: 'os',
    serviceName: 'contacts',
    action: 'customers.findOne',
    isRPC: true,
    data: {
      code: register_number
    }
  });

  if (!customer) {
    return;
  }

  // remove bank account no
  let customFieldsData = (customer.customFieldsData || []).filter(
    ({ field }) => field !== bankAccountNoField
  );

  customFieldsData.push({
    field: bankAccountNoField,
    value: account_number,
    stringValue: account_number
  });

  await sendCommonMessage({
    subdomain: 'os',
    serviceName: 'contacts',
    action: 'customers.updateCustomer',
    isRPC: true,
    data: {
      _id: customer._id,
      doc: {
        customFieldsData
      }
    }
  });
};

const handleBulkOperation = async (
  filePath: string,
  rowIndex: number,
  rows: any
) => {
  for (const row of rows) {
    try {
      const parsedRow = Object.values(row);

      if (filePath.includes('users.csv')) {
        await importUsers(parsedRow);
      } else {
        await importBankInfo(parsedRow);
      }
    } catch (e) {
      console.log(`Error during line ${rowIndex}`, e.message);
    }
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
