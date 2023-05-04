import * as xlsxPopulate from 'xlsx-populate';
import * as mongoose from 'mongoose';
import * as moment from 'moment';
import { connect } from '../utils';
import { createAWS } from '../../data/utils';
import messageBroker, { getFileUploadConfigs } from '../../messageBroker';
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

/*
 * Save binary data to amazon s3
 */
export const uploadFileAWS = async (
  excelHeader: any,
  docs: any,
  type: string
): Promise<{ file: string; rowIndex: number; error: string }> => {
  const { AWS_BUCKET } = await getFileUploadConfigs();

  // initialize s3
  const s3 = await createAWS();

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

  const fileName = `${type} - ${moment().format('YYYY-MM-DD HH:mm')}`;

  const response: any = await new Promise(resolve => {
    s3.upload(
      {
        ContentType:
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        Bucket: AWS_BUCKET,
        Key: fileName,
        Body: excelData,
        ACL: 'public-read'
      },
      (err, res) => {
        if (err) {
          return resolve({ error: err.message });
        }
        return resolve(res);
      }
    );
  });

  const file = response.Location;
  const error = response.error;

  return { file, rowIndex, error };
};

connect()
  .then(async () => {
    console.log(`Worker message recieved`);

    const {
      contentType,
      exportHistoryId,
      columnsConfig,
      segmentData
    }: {
      contentType: string;
      exportHistoryId: string;
      columnsConfig: string[];
      segmentData: string;
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
          segmentData
        },
        timeout: 5 * 60 * 1000
      }
    );

    const { UPLOAD_SERVICE_TYPE } = await getFileUploadConfigs();

    let result = {} as any;

    if (UPLOAD_SERVICE_TYPE === 'AWS') {
      result = await uploadFileAWS(excelHeader, docs, type);
    }

    let finalResponse = {
      exportLink: result.file,
      total: result.rowIndex - 1,
      status: 'success',
      errorMsg: ''
    };

    if (result.error) {
      finalResponse = {
        exportLink: result.file,
        total: result.rowIndex - 1,
        status: 'failed',
        errorMsg: `Error occurred during uploading AWS "${result.error}"`
      };
    }

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
