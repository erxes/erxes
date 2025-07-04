import * as xlsxPopulate from "xlsx-populate";
import * as moment from "moment";
import * as fs from "fs";
import { createAWS, createCFR2, uploadsFolderPath } from "../../data/utils";
import { getFileUploadConfigs } from "../../messageBroker";
import { generateModels, IModels } from "../../connectionResolvers";
import { sendRPCMessage } from "@erxes/api-utils/src/messageBroker";
import { disconnect } from "@erxes/api-utils/src/mongo-connection";

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
const { parentPort, workerData } = require("worker_threads");

const { subdomain } = workerData;

export const getConfigs = async (models) => {
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
  const fileName = `${type} - ${moment().format("YYYY-MM-DD HH-mm")}`;

  const excelData = await generateXlsx(workbook);

  let error = "";

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
  subdomain: string,
  workbook: any,
  rowIndex: any,
  type: string
): Promise<{ file: string; rowIndex: number; error: string }> => {
  const { AWS_BUCKET, FILE_SYSTEM_PUBLIC } =
    await getFileUploadConfigs(subdomain);

  // initialize s3
  const s3 = await createAWS(subdomain);

  const excelData = await generateXlsx(workbook);

  const fileName = `${type} - ${moment().format("YYYY-MM-DD HH-mm")}.xlsx`;

  const response: any = await new Promise((resolve) => {
    s3.upload(
      {
        ContentType:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        Bucket: AWS_BUCKET,
        Key: fileName,
        Body: excelData,
        ACL: FILE_SYSTEM_PUBLIC === "true" ? "public-read" : undefined
      },
      (err, res) => {
        if (err) {
          return resolve({ error: err.message });
        }
        return resolve(res);
      }
    );
  });

  const file = FILE_SYSTEM_PUBLIC === "true" ? response.Location : fileName;
  const error = response.error;

  return { file, rowIndex, error };
};

export const uploadFileCloudflare = async (
  subdomain: string,
  workbook: any,
  rowIndex: any,
  type: string
): Promise<{ file: string; rowIndex: number; error: string }> => {
  const { CLOUDFLARE_BUCKET_NAME, FILE_SYSTEM_PUBLIC } =
    await getFileUploadConfigs(subdomain);

  // initialize s3
  const s3 = await createCFR2(subdomain);

  const excelData = await generateXlsx(workbook);

  const fileName = `${type} - ${moment().format("YYYY-MM-DD HH-mm")}.xlsx`;

  const response: any = await new Promise((resolve) => {
    s3.upload(
      {
        ContentType:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        Bucket: CLOUDFLARE_BUCKET_NAME,
        Key: fileName,
        Body: excelData,
        ACL: FILE_SYSTEM_PUBLIC === "true" ? "public-read" : undefined
      },
      (err, res) => {
        if (err) {
          return resolve({ error: err.message });
        }
        return resolve(res);
      }
    );
  });

  const file = FILE_SYSTEM_PUBLIC === "true" ? response.Location : fileName;
  const error = response.error;

  return { file, rowIndex, error };
};

async function main() {
  try {
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

    const [serviceName, type] = contentType.split(":");

    const {
      totalCount = 0,
      excelHeader = [],
      error
    } = await sendRPCMessage(`${serviceName}:exporter.prepareExportData`, {
      subdomain,
      data: {
        contentType,
        columnsConfig,
        segmentData
      },
      timeout: 5 * 60 * 1000 // 5 minutes
    });

    const perPage = 10;
    const totalIterations = Math.ceil(totalCount / perPage);

    let docs = [] as any;
    let percentage = 0;

    for (let page = 1; page <= totalIterations; page++) {
      const response = await sendRPCMessage(
        `${serviceName}:exporter.getExportDocs`,
        {
          subdomain,
          data: {
            contentType,
            columnsConfig,
            segmentData,
            page,
            perPage
          },
          timeout: 5 * 60 * 1000 // 5 minutes
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

    const { UPLOAD_SERVICE_TYPE } = await getFileUploadConfigs(subdomain);

    let result = {} as any;

    const { workbook, sheet } = await createXlsFile();

    for (let i = 1; i <= excelHeader.length; i++) {
      sheet.cell(1, i).value(excelHeader[i - 1]);
    }

    let rowIndex = 2;

    for (const doc of docs) {
      let columnIndex = 0;

      for (const header of excelHeader) {
        let value = doc[header];

        if (Array.isArray(value) && !value.length) {
          value = "";
        }

        sheet.cell(rowIndex, columnIndex + 1).value(value || "-");
        columnIndex++;
      }

      rowIndex++;
    }

    if (UPLOAD_SERVICE_TYPE === "AWS") {
      result = await uploadFileAWS(subdomain, workbook, rowIndex, type);
    }

    if (UPLOAD_SERVICE_TYPE === "CLOUDFLARE") {
      result = await uploadFileCloudflare(subdomain, workbook, rowIndex, type);
    }

    if (UPLOAD_SERVICE_TYPE === "local") {
      result = await uploadFileLocal(workbook, rowIndex, type);
    }

    let finalResponse = {
      exportLink: result.file,
      total: totalCount,
      status: "success",
      uploadType: UPLOAD_SERVICE_TYPE,
      errorMsg: "",
      percentage: 100
    };

    if (result.error) {
      finalResponse = {
        exportLink: result.file,
        total: totalCount,
        status: "failed",
        uploadType: UPLOAD_SERVICE_TYPE,
        errorMsg: `Error occurred during uploading ${UPLOAD_SERVICE_TYPE} "${result.error}"`,
        percentage: 100
      };
    }

    await models.ExportHistory.updateOne(
      { _id: exportHistoryId },
      finalResponse
    );

    console.log(`Worker done`);

    parentPort.postMessage({
      action: "remove",
      message: "Successfully finished the job"
    });

    await disconnect();
  } catch (e) {
    console.log(`Worker error`, e);
  }
}

main();
