// import { sendMessage } from '@erxes/api-utils/src/core';
import { connect } from '../utils';
import messageBroker from '../../messageBroker';

// tslint:disable-next-line
const { parentPort, workerData } = require('worker_threads');

connect()
  .then(async () => {
    console.log(`Worker message recieved`);

    const {
      contentType,
      exportHistoryId,
      columnsConfig,
      subdomain
    }: {
      contentType: string;
      exportHistoryId: string;
      columnsConfig: string[];
      subdomain: string;
    } = workerData;

    console.log(subdomain);

    const serviceName = contentType.split(':')[0];

    const doc = await messageBroker().sendRPCMessage(
      `${serviceName}:exporter:prepareExportData`,
      {
        subdomain,
        data: {
          contentType,
          columnsConfig
        }
      }
    );

    console.log(doc);

    parentPort.postMessage({
      action: 'remove',
      message: 'Successfully finished the job'
    });
  })
  .catch(e => {
    console.log(e);
    throw e;
  });
