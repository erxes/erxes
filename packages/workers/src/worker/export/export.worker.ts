import * as xlsxPopulate from 'xlsx-populate';
import * as mongoose from 'mongoose';
import * as moment from 'moment';
import * as fs from 'fs';
import { connect } from '../utils';
import { createAWS, uploadsFolderPath } from '../../data/utils';
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
 * Save binary data to local
 */
export const uploadFileLocal = async (
  workbook: any,
  rowIndex: any,
  type: string
): Promise<{ file: string; rowIndex: number; error: string }> => {
  const fileName = `${type} - ${moment().format('YYYY-MM-DD HH:mm')}`;

  const excelData = await generateXlsx(workbook);

  let error = '';

  try {
    if (!fs.existsSync(`${uploadsFolderPath}`)) {
      fs.mkdirSync(`${uploadsFolderPath}`, { recursive: true });
    }

    await fs.promises.writeFile(
      `${uploadsFolderPath}/${fileName}.xlsx`,
      excelData
    );
  } catch (e) {
    error = e.message;
  }

  const file = `${fileName}.xlsx`;

  return { file, rowIndex, error };
};

/*
 * Save binary data to amazon s3
 */
export const uploadFileAWS = async (
  workbook: any,
  rowIndex: any,
  type: string
): Promise<{ file: string; rowIndex: number; error: string }> => {
  const { AWS_BUCKET, FILE_SYSTEM_PUBLIC } = await getFileUploadConfigs();

  // initialize s3
  const s3 = await createAWS();

  const excelData = await generateXlsx(workbook);

  const fileName = `${type} - ${moment().format('YYYY-MM-DD HH:mm')}.xlsx`;

  const response: any = await new Promise(resolve => {
    s3.upload(
      {
        ContentType:
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        Bucket: AWS_BUCKET,
        Key: fileName,
        Body: excelData,
        ACL: FILE_SYSTEM_PUBLIC === 'true' ? 'public-read' : undefined
      },
      (err, res) => {
        if (err) {
          return resolve({ error: err.message });
        }
        return resolve(res);
      }
    );
  });

  const file = FILE_SYSTEM_PUBLIC === 'true' ? response.Location : fileName;
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

    const { totalCount, excelHeader } = await messageBroker().sendRPCMessage(
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

    const perPage = 10;
    const totalIterations = Math.ceil(totalCount / perPage);

    let docs = [] as any;
    let percentage = 0;

    for (let page = 1; page <= totalIterations; page++) {
      const response = await messageBroker().sendRPCMessage(
        `${serviceName}:exporter:getExportDocs`,
        {
          subdomain,
          data: {
            contentType,
            columnsConfig,
            segmentData,
            page,
            perPage
          },
          timeout: 5 * 60 * 1000
        }
      );

      percentage = Number(
        ((((page - 1) * perPage) / totalCount) * 100).toFixed(2)
      );

      await models.ExportHistory.updateOne(
        { _id: exportHistoryId },
        { $set: { percentage } }
      );

      docs = docs.concat(response ? response.docs || [] : []);
    }

    const { UPLOAD_SERVICE_TYPE } = await getFileUploadConfigs();

    let result = {} as any;

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

    if (UPLOAD_SERVICE_TYPE === 'AWS') {
      result = await uploadFileAWS(workbook, rowIndex, type);
    }

    if (UPLOAD_SERVICE_TYPE === 'local') {
      result = await uploadFileLocal(workbook, rowIndex, type);
    }

    let finalResponse = {
      exportLink: result.file,
      total: totalCount,
      status: 'success',
      uploadType: UPLOAD_SERVICE_TYPE,
      errorMsg: '',
      percentage: 100
    };

    if (result.error) {
      finalResponse = {
        exportLink: result.file,
        total: totalCount,
        status: 'failed',
        uploadType: UPLOAD_SERVICE_TYPE,
        errorMsg: `Error occurred during uploading ${UPLOAD_SERVICE_TYPE} "${result.error}"`,
        percentage: 100
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
