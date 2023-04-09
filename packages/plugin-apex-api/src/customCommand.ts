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

        return handleBulkOperation(rowIndex, rows)
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
        handleBulkOperation(rowIndex, rows).then(() => {
          resolve('success');
        });
      })
      .on('error', e => reject(e));
  });
};

const handleBulkOperation = async (rowIndex: number, rows: any) => {
  const result: unknown[] = [];

  for (const row of rows) {
    try {
      const parsedRow = Object.values(row);

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
      ] = parsedRow;

      if (!email || !register_number) {
        continue;
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
            field: 'tn9HoKuwwXDrf9zgm',
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
          data: doc
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
            clientPortalId:
              process.env.NODE_ENV === 'production'
                ? '5JNSjcL8eRuRuAxFK'
                : 'fEHX3LsHH6AsKxRCL',
            email,
            phone: mobile_number,
            firstName: first_name,
            lastName: last_name,
            erxesCustomerId: customer._id
          }
        });
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
