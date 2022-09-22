// import { sendMessage } from '@erxes/api-utils/src/core';
import { connect } from '../utils';

// tslint:disable-next-line
const { parentPort, workerData } = require('worker_threads');

connect()
  .then(async () => {
    console.log(`Worker message recieved`);

    const {
      contentType,
      exportHistoryId,
      columnsConfig
    }: {
      contentType: string;
      exportHistoryId: string;
      columnsConfig: string[];
    } = workerData;

    console.log(contentType, exportHistoryId, columnsConfig, 'hshshshshshhshs');

    for (let i = 0; i < 100; i++) {
      console.log(i);
    }

    parentPort.postMessage({
      action: 'remove',
      message: 'Successfully finished the job'
    });
  })
  .catch(e => {
    console.log(e);
    throw e;
  });
