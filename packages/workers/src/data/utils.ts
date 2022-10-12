import * as fs from 'fs';
import * as path from 'path';
import * as AWS from 'aws-sdk';
import * as readline from 'readline';
import csvParser = require('csv-parser');
import utils from '@erxes/api-utils/src';
import { getFileUploadConfigs } from '../messageBroker';

export const uploadsFolderPath = path.join(__dirname, '../private/uploads');

export const getS3FileInfo = async ({ s3, query, params }): Promise<string> => {
  return new Promise((resolve, reject) => {
    s3.selectObjectContent(
      {
        ...params,
        ExpressionType: 'SQL',
        Expression: query,
        InputSerialization: {
          CSV: {
            FileHeaderInfo: 'NONE',
            RecordDelimiter: '\n',
            FieldDelimiter: ',',
            AllowQuotedRecordDelimiter: true
          }
        },
        OutputSerialization: {
          CSV: {
            RecordDelimiter: '\n',
            FieldDelimiter: ','
          }
        }
      },
      (error, data) => {
        if (error) {
          return reject(error);
        }

        if (!data) {
          return reject('Failed to get file info');
        }

        // data.Payload is a Readable Stream
        const eventStream: any = data.Payload;

        let result;

        // Read events as they are available
        eventStream.on('data', event => {
          if (event.Records) {
            result = event.Records.Payload.toString();
          }
        });
        eventStream.on('end', () => {
          resolve(result);
        });
      }
    );
  });
};

export const createAWS = async () => {
  const {
    AWS_FORCE_PATH_STYLE,
    AWS_COMPATIBLE_SERVICE_ENDPOINT,
    AWS_BUCKET,
    AWS_SECRET_ACCESS_KEY,
    AWS_ACCESS_KEY_ID
  } = await getFileUploadConfigs();

  if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY || !AWS_BUCKET) {
    throw new Error('AWS credentials are not configured');
  }

  const options: {
    accessKeyId: string;
    secretAccessKey: string;
    endpoint?: string;
    s3ForcePathStyle?: boolean;
  } = {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY
  };

  if (AWS_FORCE_PATH_STYLE === 'true') {
    options.s3ForcePathStyle = true;
  }

  if (AWS_COMPATIBLE_SERVICE_ENDPOINT) {
    options.endpoint = AWS_COMPATIBLE_SERVICE_ENDPOINT;
  }

  // initialize s3
  return new AWS.S3(options);
};

export const getImportCsvInfo = async (fileName: string) => {
  const { UPLOAD_SERVICE_TYPE } = await getFileUploadConfigs();

  return new Promise(async (resolve, reject) => {
    if (UPLOAD_SERVICE_TYPE === 'local') {
      const results = [] as any;
      let i = 0;

      const readStream = fs.createReadStream(
        `${uploadsFolderPath}/${fileName}`
      );

      readStream
        .pipe(csvParser())
        .on('data', data => {
          i++;
          if (i <= 3) {
            results.push(data);
          }
          if (i >= 3) {
            resolve(results);
          }
        })
        .on('close', () => {
          resolve(results);
        })
        .on('error', () => {
          reject();
        });
    } else {
      const { AWS_BUCKET } = await getFileUploadConfigs();
      const s3 = await createAWS();

      const params = { Bucket: AWS_BUCKET, Key: fileName };

      const request = s3.getObject(params);
      const readStream = request.createReadStream();

      const results = [] as any;
      let i = 0;

      readStream
        .pipe(csvParser())
        .on('data', data => {
          i++;
          if (i <= 3) {
            results.push(data);
          }
          if (i >= 3) {
            resolve(results);
          }
        })

        .on('close', () => {
          resolve(results);
        })
        .on('error', () => {
          reject();
        });
    }
  });
};

export const getCsvHeadersInfo = async (fileName: string) => {
  const { UPLOAD_SERVICE_TYPE } = await getFileUploadConfigs();

  return new Promise(async resolve => {
    if (UPLOAD_SERVICE_TYPE === 'local') {
      const readSteam = fs.createReadStream(`${uploadsFolderPath}/${fileName}`);

      let columns;
      let total = 0;

      const rl = readline.createInterface({
        input: readSteam,
        terminal: false
      });

      rl.on('line', input => {
        if (total === 0) {
          columns = input;
        }

        if (total > 0) {
          resolve(columns);
        }

        total++;
      });

      rl.on('close', () => {
        resolve(columns);
      });
    } else {
      const { AWS_BUCKET } = await getFileUploadConfigs();
      const s3 = await createAWS();

      const params = { Bucket: AWS_BUCKET, Key: fileName };

      // exclude column

      const columns = await getS3FileInfo({
        s3,
        params,
        query: 'SELECT * FROM S3Object LIMIT 1'
      });

      return resolve(columns);
    }
  });
};

export const paginate = utils.paginate;
