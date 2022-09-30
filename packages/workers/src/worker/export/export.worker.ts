import * as xlsxPopulate from 'xlsx-populate';
import * as mongoose from 'mongoose';
import * as moment from 'moment';
import { connect } from '../utils';
import { createAWS } from '../../data/utils';
import messageBroker from '../../messageBroker';
import { generateModels, IModels } from '../../connectionResolvers';

export const createXlsFile = async () => {
  // Generating blank workbook
  const workbook = await xlsxPopulate.fromBlankAsync();

  return { workbook, sheet: workbook.sheet(0) };
};

/**
 * Generates downloadable xls file on the url
 */
export const generateXlsx = async (workbook: any): Promise<string> => {
  return workbook.outputAsync();
};

// tslint:disable-next-line
const { parentPort, workerData } = require('worker_threads');

const { subdomain } = workerData;

export const getConfigs = async models => {
  const configsMap = {};
  const configs = await models.Configs.find({}).lean();

  for (const config of configs) {
    configsMap[config.code] = config.value;
  }

  return configsMap;
};

export const getConfig = async (
  code: string,
  defaultValue?: string,
  models?: IModels
) => {
  const configs = await getConfigs(models);

  if (!configs[code]) {
    return defaultValue;
  }

  return configs[code];
};

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

    const models = await generateModels(subdomain);

    // const serviceName = contentType.split(':')[0];

    const [serviceName, type] = contentType.split(':');

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

    console.log(bulkDoc, 'bulkDoc');

    const { workbook, sheet } = await createXlsFile();
    sheet.cell(1, 1).value('sda');

    const hi = await generateXlsx(workbook);

    // const AWS_BUCKET = await getConfig('AWS_BUCKET', '', models);

    const s3 = await createAWS();

    const response: any = await new Promise((resolve, reject) => {
      s3.upload(
        {
          ContentType:
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          Bucket: 'erxes',
          Key: `${type} - ${moment().format('YYYY-MM-DD HH:mm')}`,
          Body: hi,
          ACL: 'public-read'
        },
        (err, res) => {
          if (err) {
            return reject(err);
          }

          return resolve(res);
        }
      );
    });

    console.log(response, 'response');

    await models.ExportHistory.updateOne({ _id: exportHistoryId }, 'test');

    mongoose.connection.close();

    console.log(`Worker done`);

    parentPort.postMessage({
      action: 'remove',
      message: 'Successfully finished the job'
    });
  })
  .catch(e => {
    console.log(e);
    throw e;
  });
