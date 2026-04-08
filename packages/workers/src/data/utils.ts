import * as fs from "fs";
import * as path from "path";
import * as AWS from "aws-sdk";
import * as readline from "readline";
import csvParser = require("csv-parser");
import utils from "@erxes/api-utils/src";
import { getFileUploadConfigs } from "../messageBroker";
import { getService } from "@erxes/api-utils/src/serviceDiscovery";
import fetch from "node-fetch";
import { pipeline } from "node:stream/promises";
import sanitizeFilename from "@erxes/api-utils/src/sanitize-filename";

export const uploadsFolderPath = path.join(__dirname, "../private/uploads");

export const getS3FileInfo = async ({ s3, query, params }): Promise<string> => {
  return new Promise((resolve, reject) => {
    s3.selectObjectContent(
      {
        ...params,
        ExpressionType: "SQL",
        Expression: query,
        InputSerialization: {
          CSV: {
            FileHeaderInfo: "NONE",
            RecordDelimiter: "\n",
            FieldDelimiter: ",",
            AllowQuotedRecordDelimiter: true,
          },
        },
        OutputSerialization: {
          CSV: {
            RecordDelimiter: "\n",
            FieldDelimiter: ",",
          },
        },
      },
      (error, data) => {
        if (error) {
          return reject(error);
        }

        if (!data) {
          return reject("Failed to get file info");
        }

        // data.Payload is a Readable Stream
        const eventStream: any = data.Payload;

        let result;

        // Read events as they are available
        eventStream.on("data", event => {
          if (event.Records) {
            result = event.Records.Payload.toString();
          }
        });
        eventStream.on("end", () => {
          resolve(result);
        });
      }
    );
  });
};

export const createAWS = async subdomain => {
  const {
    AWS_FORCE_PATH_STYLE,
    AWS_COMPATIBLE_SERVICE_ENDPOINT,
    AWS_BUCKET,
    AWS_SECRET_ACCESS_KEY,
    AWS_ACCESS_KEY_ID,
  } = await getFileUploadConfigs(subdomain);

  if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY || !AWS_BUCKET) {
    throw new Error("AWS credentials are not configured");
  }

  const options: {
    accessKeyId: string;
    secretAccessKey: string;
    endpoint?: string;
    s3ForcePathStyle?: boolean;
  } = {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  };

  if (AWS_FORCE_PATH_STYLE === "true") {
    options.s3ForcePathStyle = true;
  }

  if (AWS_COMPATIBLE_SERVICE_ENDPOINT) {
    options.endpoint = AWS_COMPATIBLE_SERVICE_ENDPOINT;
  }

  // initialize s3
  return new AWS.S3(options);
};

export const createCFR2 = async subdomain => {
  const {
    CLOUDFLARE_ACCOUNT_ID,
    CLOUDFLARE_ACCESS_KEY_ID,
    CLOUDFLARE_SECRET_ACCESS_KEY,
  } = await getFileUploadConfigs(subdomain);

  const CLOUDFLARE_ENDPOINT = `https://${CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`;

  if (!CLOUDFLARE_ACCESS_KEY_ID || !CLOUDFLARE_SECRET_ACCESS_KEY) {
    throw new Error("Cloudflare Credentials are not configured");
  }

  const options: {
    endpoint?: string;
    accessKeyId: string;
    secretAccessKey: string;
    signatureVersion: "v4";
    region: string;
  } = {
    endpoint: CLOUDFLARE_ENDPOINT,
    accessKeyId: CLOUDFLARE_ACCESS_KEY_ID,
    secretAccessKey: CLOUDFLARE_SECRET_ACCESS_KEY,
    signatureVersion: "v4",
    region: "auto",
  };

  return new AWS.S3(options);
};

export const getImportCsvInfo = async (subdomain, fileName: string) => {
  const { UPLOAD_SERVICE_TYPE } = await getFileUploadConfigs(subdomain);
  const sanitizedFilename = sanitizeFilename(fileName);

  const destinationPath = path.join(uploadsFolderPath, sanitizedFilename);

  if (UPLOAD_SERVICE_TYPE !== "local") {
    const service: any = await getService("core");

    const url = `${service.address}/get-import-file/${sanitizedFilename}`;

    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(response.statusText);
      }

      await fs.promises.mkdir(uploadsFolderPath, { recursive: true });
      await pipeline(response.body, fs.createWriteStream(destinationPath));
    } catch (e) {
      console.error(
        `${service.name} csv download from ${url} to ${uploadsFolderPath}/${sanitizedFilename} failed.`,
        e.message
      );
    }
  }

  return new Promise(async (resolve, reject) => {
    if (UPLOAD_SERVICE_TYPE === "local") {
      const results = [] as any;
      let i = 0;

      const readStream = fs.createReadStream(
        `${uploadsFolderPath}/${sanitizedFilename}`
      );

      readStream
        .pipe(csvParser())
        .on("data", data => {
          i++;
          if (i <= 3) {
            results.push(data);
          }
          if (i >= 3) {
            resolve(results);
          }
        })
        .on("close", () => {
          resolve(results);
        })
        .on("error", () => {
          reject();
        });
    } else {
      const { AWS_BUCKET, CLOUDFLARE_BUCKET_NAME } =
        await getFileUploadConfigs(subdomain);

      const s3 =
        UPLOAD_SERVICE_TYPE === "AWS"
          ? await createAWS(subdomain)
          : await createCFR2(subdomain);

      const bucket =
        UPLOAD_SERVICE_TYPE === "AWS" ? AWS_BUCKET : CLOUDFLARE_BUCKET_NAME;

      const params = { Bucket: bucket, Key: sanitizedFilename };

      const request = s3.getObject(params);
      const readStream = request.createReadStream();

      const results = [] as any;
      let i = 0;

      readStream
        .pipe(csvParser())
        .on("data", data => {
          i++;
          if (i <= 3) {
            results.push(data);
          }
          if (i >= 3) {
            resolve(results);
          }
        })

        .on("close", () => {
          resolve(results);
        })
        .on("error", () => {
          reject();
        });
    }
  });
};

export const getCsvHeadersInfo = async (subdomain, fileName: string) => {
  const { UPLOAD_SERVICE_TYPE } = await getFileUploadConfigs(subdomain);
  const sanitizedFilename = sanitizeFilename(fileName);

  return new Promise(async resolve => {
    if (UPLOAD_SERVICE_TYPE === "local") {
      const readSteam = fs.createReadStream(
        `${uploadsFolderPath}/${sanitizedFilename}`
      );

      let columns;
      let total = 0;

      const rl = readline.createInterface({
        input: readSteam,
        terminal: false,
      });

      rl.on("line", input => {
        if (total === 0) {
          columns = input;
        }

        if (total > 0) {
          resolve(columns);
        }

        total++;
      });

      rl.on("close", () => {
        resolve(columns);
      });
    } else {
      const { AWS_BUCKET, CLOUDFLARE_BUCKET_NAME } =
        await getFileUploadConfigs(subdomain);

      const s3 =
        UPLOAD_SERVICE_TYPE === "AWS"
          ? await createAWS(subdomain)
          : await createCFR2(subdomain);

      const bucket =
        UPLOAD_SERVICE_TYPE === "AWS" ? AWS_BUCKET : CLOUDFLARE_BUCKET_NAME;

      const params = { Bucket: bucket, Key: sanitizedFilename };
      // exclude column

      const columns = await getS3FileInfo({
        s3,
        params,
        query: "SELECT * FROM S3Object LIMIT 1",
      });

      return resolve(columns);
    }
  });
};

export const paginate = utils.paginate;
