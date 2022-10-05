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
      columnsConfig,
      segmentId
    }: {
      contentType: string;
      exportHistoryId: string;
      columnsConfig: string[];
      segmentId: string;
    } = workerData;

    const models = await generateModels(subdomain);

    const [serviceName, type] = contentType.split(':');

    const { excelHeader, docs } = await messageBroker().sendRPCMessage(
      `${serviceName}:exporter:prepareExportData`,
      {
        subdomain,
        data: {
          contentType,
          columnsConfig,
          segmentId
        }
      }
    );

    const { workbook, sheet } = await createXlsFile();

    for (let i = 1; i <= excelHeader.length; i++) {
      sheet.cell(1, i).value(excelHeader[i - 1]);
    }

    let rowIndex = 2;

    for (const doc of docs) {
      let columnIndex = 0;

      for (const header of excelHeader) {
        const value = doc[header];

        sheet.cell(rowIndex, columnIndex + 1).value(value || '-');
        columnIndex++;
      }

      rowIndex++;
    }

    const excelData = await generateXlsx(workbook);

    const s3 = await createAWS();

    const response: any = await new Promise((resolve, reject) => {
      s3.upload(
        {
          ContentType:
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          Bucket: 'erxes',
          Key: `${type} - ${moment().format('YYYY-MM-DD HH:mm')}`,
          Body: excelData,
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

    console.log(response);

    const finalResponse = {
      exportLink: response.Location,
      total: rowIndex - 1,
      status: 'Success'
    };

    await models.ExportHistory.updateOne(
      { _id: exportHistoryId },
      finalResponse
    );

    mongoose.connection.close();

    console.log(`Worker done`);

    parentPort.postMessage({
      action: 'remove',
      message: 'Successfully finished the job'
    });
  })
  .catch(e => {
    throw e;
  });
