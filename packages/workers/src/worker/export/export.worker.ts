import { connect } from '../utils';
import messageBroker from '../../messageBroker';

// tslint:disable-next-line
const { parentPort, workerData } = require('worker_threads');
const { subdomain } = workerData;

const create = async ({
  docs,
  contentType
}: {
  docs: any;
  contentType: any;
}) => {
  console.log('Exporting  dataaa');

  const [serviceName, type] = contentType.split(':');
  try {
    console.log(serviceName);
    const result = await messageBroker().sendRPCMessage(
      `${serviceName}:exporter:insertttttExportItems`,
      {
        subdomain,
        data: {
          docs,
          contentType: type
        }
      }
    );

    console.log(result, 'ajajajjajajajajajjajaja');

    const { objects, error } = result;

    if (error) {
      throw new Error(error);
    }
    return { objects };
  } catch (e) {
    console.log(e);
  }
};

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

    const serviceName = contentType.split(':')[0];

    const bulkDoc = await messageBroker().sendRPCMessage(
      `${serviceName}:exporter:prepareExportData`,
      {
        subdomain,
        data: {
          contentType,
          columnsConfig
        }
      }
    );

    try {
      const { objects } = await create({
        docs: bulkDoc,
        contentType
      });

      console.log(objects, 'data');
    } catch (e) {
      console.log(e, '23');
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
