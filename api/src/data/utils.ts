import * as AWS from 'aws-sdk';
import utils from 'erxes-api-utils';
import { IEmailParams as IEmailParamsC } from 'erxes-api-utils/lib/emails';
import { ISendNotification as ISendNotificationC } from 'erxes-api-utils/lib/requests';
import * as fileType from 'file-type';
import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';
import * as puppeteer from 'puppeteer';
import * as strip from 'strip';
import * as xlsxPopulate from 'xlsx-populate';
import * as models from '../db/models';
import { IUser, IUserDocument } from '../db/models/definitions/users';
import { debugBase, debugError } from '../debuggers';
import memoryStorage from '../inmemoryStorage';
import { graphqlPubsub } from '../pubsub';
import { sendToWebhook as sendToWebhookC } from 'erxes-api-utils';
import csvParser = require('csv-parser');
import * as readline from 'readline';
import * as _ from 'underscore';

export const uploadsFolderPath = path.join(__dirname, '../private/uploads');

export const initFirebase = (code: string): void => {
  if (code.length === 0) {
    return;
  }

  const codeString = code.trim();

  if (codeString[0] === '{' && codeString[codeString.length - 1] === '}') {
    const serviceAccount = JSON.parse(codeString);

    if (serviceAccount.private_key) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    }
  }
};

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

export const getImportCsvInfo = async (fileName: string) => {
  const UPLOAD_SERVICE_TYPE = await getConfig('UPLOAD_SERVICE_TYPE', 'AWS');

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
      const AWS_BUCKET = await getConfig('AWS_BUCKET');
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
  const UPLOAD_SERVICE_TYPE = await getConfig('UPLOAD_SERVICE_TYPE', 'AWS');

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
      const AWS_BUCKET = await getConfig('AWS_BUCKET');
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

/*
 * Check that given file is not harmful
 */
export const checkFile = async (file, source?: string) => {
  if (!file) {
    throw new Error('Invalid file');
  }

  const { size } = file;

  // 20mb
  if (size > 20 * 1024 * 1024) {
    return 'Too large file';
  }

  // read file
  const buffer = await fs.readFileSync(file.path);

  // determine file type using magic numbers
  const ft = fileType(buffer);

  const unsupportedMimeTypes = [
    'text/csv',
    'image/svg+xml',
    'text/plain',
    'application/vnd.ms-excel'
  ];

  const oldMsOfficeDocs = [
    'application/msword',
    'application/vnd.ms-excel',
    'application/vnd.ms-powerpoint'
  ];

  // allow csv, svg to be uploaded
  if (!ft && unsupportedMimeTypes.includes(file.type)) {
    return 'ok';
  }

  if (!ft) {
    return 'Invalid file type';
  }

  const { mime } = ft;

  // allow old ms office docs to be uploaded
  if (mime === 'application/x-msi' && oldMsOfficeDocs.includes(file.type)) {
    return 'ok';
  }

  const defaultMimeTypes = [
    'image/png',
    'image/jpeg',
    'image/jpg',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/pdf',
    'image/gif'
  ];

  const UPLOAD_FILE_TYPES = await getConfig(
    source === 'widgets' ? 'WIDGETS_UPLOAD_FILE_TYPES' : 'UPLOAD_FILE_TYPES'
  );

  if (
    !(
      (UPLOAD_FILE_TYPES && UPLOAD_FILE_TYPES.split(',')) ||
      defaultMimeTypes
    ).includes(mime)
  ) {
    return 'Invalid configured file type';
  }

  return 'ok';
};

/**
 * Create AWS instance
 */
export const createAWS = async () => {
  const AWS_ACCESS_KEY_ID = await getConfig('AWS_ACCESS_KEY_ID');
  const AWS_SECRET_ACCESS_KEY = await getConfig('AWS_SECRET_ACCESS_KEY');
  const AWS_BUCKET = await getConfig('AWS_BUCKET');
  const AWS_COMPATIBLE_SERVICE_ENDPOINT = await getConfig(
    'AWS_COMPATIBLE_SERVICE_ENDPOINT'
  );
  const AWS_FORCE_PATH_STYLE = await getConfig('AWS_FORCE_PATH_STYLE');

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

/**
 * Create Google Cloud Storage instance
 */
const createGCS = async () => {
  const GOOGLE_APPLICATION_CREDENTIALS = await getConfig(
    'GOOGLE_APPLICATION_CREDENTIALS'
  );
  const GOOGLE_PROJECT_ID = await getConfig('GOOGLE_PROJECT_ID');
  const BUCKET = await getConfig('GOOGLE_CLOUD_STORAGE_BUCKET');

  if (!GOOGLE_PROJECT_ID || !GOOGLE_APPLICATION_CREDENTIALS || !BUCKET) {
    throw new Error('Google Cloud Storage credentials are not configured');
  }

  const Storage = require('@google-cloud/storage').Storage;

  // initializing Google Cloud Storage
  return new Storage({
    projectId: GOOGLE_PROJECT_ID,
    keyFilename: GOOGLE_APPLICATION_CREDENTIALS
  });
};

/*
 * Save binary data to amazon s3
 */
export const uploadFileAWS = async (
  file: { name: string; path: string; type: string },
  forcePrivate: boolean = false
): Promise<string> => {
  const IS_PUBLIC = forcePrivate
    ? false
    : await getConfig('FILE_SYSTEM_PUBLIC', 'true');
  const AWS_PREFIX = await getConfig('AWS_PREFIX', '');
  const AWS_BUCKET = await getConfig('AWS_BUCKET');

  // initialize s3
  const s3 = await createAWS();

  // generate unique name
  const fileName = `${AWS_PREFIX}${Math.random()}${file.name.replace(
    / /g,
    ''
  )}`;

  // read file
  const buffer = await fs.readFileSync(file.path);

  // upload to s3
  const response: any = await new Promise((resolve, reject) => {
    s3.upload(
      {
        ContentType: file.type,
        Bucket: AWS_BUCKET,
        Key: fileName,
        Body: buffer,
        ACL: IS_PUBLIC === 'true' ? 'public-read' : undefined
      },
      (err, res) => {
        if (err) {
          return reject(err);
        }

        return resolve(res);
      }
    );
  });

  return IS_PUBLIC === 'true' ? response.Location : fileName;
};

/*
 * Delete file from amazon s3
 */
export const deleteFileAWS = async (fileName: string) => {
  const AWS_BUCKET = await getConfig('AWS_BUCKET');

  const params = { Bucket: AWS_BUCKET, Key: fileName };

  // initialize s3
  const s3 = await createAWS();

  return new Promise((resolve, reject) => {
    s3.deleteObject(params, err => {
      if (err) {
        return reject(err);
      }

      return resolve('ok');
    });
  });
};

/*
 * Save file to local disk
 */
export const uploadFileLocal = async (file: {
  name: string;
  path: string;
  type: string;
}): Promise<string> => {
  const oldPath = file.path;

  if (!fs.existsSync(uploadsFolderPath)) {
    fs.mkdirSync(uploadsFolderPath);
  }

  const fileName = `${Math.random()}${file.name.replace(/ /g, '')}`;
  const newPath = `${uploadsFolderPath}/${fileName}`;
  const rawData = fs.readFileSync(oldPath);

  return new Promise((resolve, reject) => {
    fs.writeFile(newPath, rawData, err => {
      if (err) {
        return reject(err);
      }

      return resolve(fileName);
    });
  });
};

/*
 * Save file to google cloud storage
 */
export const uploadFileGCS = async (file: {
  name: string;
  path: string;
  type: string;
}): Promise<string> => {
  const BUCKET = await getConfig('GOOGLE_CLOUD_STORAGE_BUCKET');
  const IS_PUBLIC = await getConfig('FILE_SYSTEM_PUBLIC');

  // initialize GCS
  const storage = await createGCS();

  // select bucket
  const bucket = storage.bucket(BUCKET);

  // generate unique name
  const fileName = `${Math.random()}${file.name}`;

  bucket.file(fileName);

  const response: any = await new Promise((resolve, reject) => {
    bucket.upload(
      file.path,
      {
        metadata: { contentType: file.type },
        public: IS_PUBLIC === 'true'
      },
      (err, res) => {
        if (err) {
          return reject(err);
        }

        if (res) {
          return resolve(res);
        }
      }
    );
  });

  const { metadata, name } = response;

  return IS_PUBLIC === 'true' ? metadata.mediaLink : name;
};

const deleteFileLocal = async (fileName: string) => {
  return new Promise((resolve, reject) => {
    fs.unlink(`${uploadsFolderPath}/${fileName}`, error => {
      if (error) {
        return reject(error);
      }

      return resolve('deleted');
    });
  });
};

const deleteFileGCS = async (fileName: string) => {
  const BUCKET = await getConfig('GOOGLE_CLOUD_STORAGE_BUCKET');

  // initialize GCS
  const storage = await createGCS();

  // select bucket
  const bucket = storage.bucket(BUCKET);

  return new Promise((resolve, reject) => {
    bucket
      .file(fileName)
      .delete()
      .then(err => {
        if (err) {
          return reject(err);
        }

        return resolve('ok');
      });
  });
};

/**
 * Read file from GCS, AWS
 */
export const readFileRequest = async (key: string): Promise<any> => {
  const UPLOAD_SERVICE_TYPE = await getConfig('UPLOAD_SERVICE_TYPE', 'AWS');

  if (UPLOAD_SERVICE_TYPE === 'GCS') {
    const GCS_BUCKET = await getConfig('GOOGLE_CLOUD_STORAGE_BUCKET');
    const storage = await createGCS();

    const bucket = storage.bucket(GCS_BUCKET);

    const file = bucket.file(key);

    // get a file buffer
    const [contents] = await file.download({});

    return contents;
  }

  if (UPLOAD_SERVICE_TYPE === 'AWS') {
    const AWS_BUCKET = await getConfig('AWS_BUCKET');
    const s3 = await createAWS();

    return new Promise((resolve, reject) => {
      s3.getObject(
        {
          Bucket: AWS_BUCKET,
          Key: key
        },
        (error, response) => {
          if (error) {
            if (
              error.code === 'NoSuchKey' &&
              error.message.includes('key does not exist')
            ) {
              debugBase(
                `Error occurred when fetching s3 file with key: "${key}"`
              );
            }

            return reject(error);
          }

          return resolve(response.Body);
        }
      );
    });
  }

  if (UPLOAD_SERVICE_TYPE === 'local') {
    return new Promise((resolve, reject) => {
      fs.readFile(`${uploadsFolderPath}/${key}`, (error, response) => {
        if (error) {
          return reject(error);
        }

        return resolve(response);
      });
    });
  }
};

/*
 * Save binary data to amazon s3
 */
export const uploadFile = async (
  apiUrl: string,
  file,
  fromEditor = false
): Promise<any> => {
  const IS_PUBLIC = await getConfig('FILE_SYSTEM_PUBLIC');
  const UPLOAD_SERVICE_TYPE = await getConfig('UPLOAD_SERVICE_TYPE', 'AWS');

  let nameOrLink = '';

  if (UPLOAD_SERVICE_TYPE === 'AWS') {
    nameOrLink = await uploadFileAWS(file);
  }

  if (UPLOAD_SERVICE_TYPE === 'GCS') {
    nameOrLink = await uploadFileGCS(file);
  }

  if (UPLOAD_SERVICE_TYPE === 'local') {
    nameOrLink = await uploadFileLocal(file);
  }

  if (fromEditor) {
    const editorResult = { fileName: file.name, uploaded: 1, url: nameOrLink };

    if (IS_PUBLIC !== 'true') {
      editorResult.url = `${apiUrl}/read-file?key=${nameOrLink}`;
    }

    return editorResult;
  }

  return nameOrLink;
};

export const deleteFile = async (fileName: string): Promise<any> => {
  const UPLOAD_SERVICE_TYPE = await getConfig('UPLOAD_SERVICE_TYPE', 'AWS');

  if (UPLOAD_SERVICE_TYPE === 'AWS') {
    return deleteFileAWS(fileName);
  }

  if (UPLOAD_SERVICE_TYPE === 'GCS') {
    return deleteFileGCS(fileName);
  }

  if (UPLOAD_SERVICE_TYPE === 'local') {
    return deleteFileLocal(fileName);
  }
};

/**
 * Read contents of a file
 */
export const readFile = utils.readFile;

/**
 * Create default or ses transporter
 */
export const createTransporter = async ({ ses }) => {
  return utils.createTransporter(models, memoryStorage, { ses });
};

export type IEmailParams = IEmailParamsC;

/**
 * Send email
 */
export const sendEmail = async (params: IEmailParams) => {
  return utils.sendEmail(models, memoryStorage, params);
};

/**
 * Returns user's name or email
 */
export const getUserDetail = (user: IUser) => {
  return utils.getUserDetail(user);
};

export type ISendNotification = ISendNotificationC;
/**
 * Send a notification
 */
export const sendNotification = async (doc: ISendNotification) => {
  await models.Users.updateMany(
    { _id: { $in: doc.receivers } },
    { $set: { isShowNotification: false } }
  );

  for (const userId of doc.receivers) {
    graphqlPubsub.publish('userChanged', {
      userChanged: { userId }
    });
  }

  return utils.sendNotification(models, memoryStorage, graphqlPubsub, doc);
};

/**
 * Creates blank workbook
 */
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

/**
 * Sends post request to specific url
 */
export const sendRequest = utils.sendRequest;

export const registerOnboardHistory = ({
  type,
  user
}: {
  type: string;
  user: IUserDocument;
}) =>
  models.OnboardingHistories.getOrCreate({ type, user })
    .then(({ status }) => {
      if (status === 'created') {
        graphqlPubsub.publish('onboardingChanged', {
          onboardingChanged: { userId: user._id, type }
        });
      }
    })
    .catch(e => debugBase(e));

export const authCookieOptions = (secure: boolean) => {
  const oneDay = 1 * 24 * 3600 * 1000; // 1 day

  const cookieOptions = {
    httpOnly: true,
    expires: new Date(Date.now() + oneDay),
    maxAge: oneDay,
    secure
  };

  return cookieOptions;
};

export const getEnv = utils.getEnv;

/**
 * Send notification to mobile device from inbox conversations
 * @param {string} - title
 * @param {string} - body
 * @param {string} - customerId
 * @param {array} - receivers
 */
export const sendMobileNotification = async ({
  receivers,
  title,
  body,
  customerId,
  conversationId
}: {
  receivers: string[];
  customerId?: string;
  title: string;
  body: string;
  conversationId: string;
}): Promise<void> => {
  await utils.sendMobileNotification(models, {
    receivers,
    title,
    body,
    customerId,
    conversationId
  });
};

export const paginate = utils.paginate;

/*
 * Converts given value to date or if value in valid date
 * then returns default value
 */
export const fixDate = utils.fixDate;

export const getDate = utils.getDate;

export const getToday = utils.getToday;

export const getNextMonth = utils.getNextMonth;

/**
 * Send to webhook
 */

export const sendToWebhook = async (
  action: string,
  type: string,
  params: any
) => {
  await sendToWebhookC(models, { action, type, params });
};

export default {
  sendEmail,
  sendNotification,
  sendMobileNotification,
  readFile,
  createTransporter,
  sendToWebhook,
  getImportCsvInfo,
  getCsvHeadersInfo
};

export const cleanHtml = (content?: string) =>
  strip(content || '').substring(0, 100);

export const validSearchText = utils.validSearchText;

export const regexSearchText = utils.regexSearchText;

/**
 * Check user ids whether its added or removed from array of ids
 */
export const checkUserIds = utils.checkUserIds;

/*
 * Handle engage unsubscribe request
 */
export const handleUnsubscription = async (query: {
  cid: string;
  uid: string;
}) => {
  const { cid, uid } = query;

  if (cid) {
    await models.Customers.updateOne(
      { _id: cid },
      { $set: { isSubscribed: 'No' } }
    );
  }

  if (uid) {
    await models.Users.updateOne(
      { _id: uid },
      { $set: { isSubscribed: 'No' } }
    );
  }
};

export const getConfigs = async () => {
  return utils.getConfigs(models, memoryStorage);
};

export const getConfig = async (code, defaultValue?) => {
  return utils.getConfig(models, memoryStorage, code, defaultValue);
};

export const resetConfigsCache = () => {
  utils.resetConfigsCache(memoryStorage);
};

export const frontendEnv = utils.frontendEnv;

export const getSubServiceDomain = ({ name }: { name: string }): string => {
  const MAIN_APP_DOMAIN = getEnv({ name: 'MAIN_APP_DOMAIN' });

  const defaultMappings = {
    API_DOMAIN: `${MAIN_APP_DOMAIN}/api`,
    WIDGETS_DOMAIN: `${MAIN_APP_DOMAIN}/widgets`,
    INTEGRATIONS_API_DOMAIN: `${MAIN_APP_DOMAIN}/integrations`,
    LOGS_API_DOMAIN: `${MAIN_APP_DOMAIN}/logs`,
    ENGAGES_API_DOMAIN: `${MAIN_APP_DOMAIN}/engages`,
    VERIFIER_API_DOMAIN: `${MAIN_APP_DOMAIN}/verifier`,
    AUTOMATIONS_API_DOMAIN: `${MAIN_APP_DOMAIN}/automations`
  };

  const domain = getEnv({ name });

  if (domain) {
    return domain;
  }

  return defaultMappings[name];
};

export const chunkArray = utils.chunkArray;

/**
 * Create s3 stream for excel file
 */
export const s3Stream = async (
  key: string,
  errorCallback: (error: any) => void
): Promise<any> => {
  const AWS_BUCKET = await getConfig('AWS_BUCKET');

  const s3 = await createAWS();

  const stream = s3
    .getObject({ Bucket: AWS_BUCKET, Key: key })
    .createReadStream();

  stream.on('error', errorCallback);

  return stream;
};

export const getDashboardFile = async (dashboardId: string) => {
  const timeout = async ms => {
    return new Promise(resolve => setTimeout(resolve, ms));
  };

  const DASHBOARD_DOMAIN = getSubServiceDomain({ name: 'DASHBOARD_DOMAIN' });

  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();

  await page.goto(`${DASHBOARD_DOMAIN}/details/${dashboardId}?pdf=true`);
  await timeout(5000);

  const pdf = await page.pdf({ format: 'A4' });

  await browser.close();

  return pdf;
};

export const getCoreDomain = () => {
  const NODE_ENV = process.env.NODE_ENV;

  return NODE_ENV === 'production'
    ? 'https://erxes.io'
    : 'http://localhost:3500';
};

/**
 * Escaping, special characters
 */
export const escapeRegExp = (str: string) => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

export const routeErrorHandling = (fn, callback?: any) => {
  return async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (e) {
      debugError(e);

      if (callback) {
        return callback(res, e, next);
      }

      return next(e);
    }
  };
};

export const isUsingElk = () => {
  const ELK_SYNCER = getEnv({ name: 'ELK_SYNCER', defaultValue: 'true' });

  return ELK_SYNCER === 'false' ? false : true;
};

/**
 * Splits text into chunks of strings limited by given character count
 * .{1,100}(\s|$)
 * . - matches any character (except for line terminators)
 * {1,100} - matches the previous token between 1 and 100 times, as many times as possible, giving back as needed (greedy)
 * (\s|$) - capturing group
 * \s - matches any whitespace character
 * $ - asserts position at the end of the string
 *
 * @param str text to be split
 * @param size character length of each chunk
 */
export const splitStr = (str: string, size: number): string[] => {
  const cleanStr = strip(str);

  return cleanStr.match(new RegExp(new RegExp(`.{1,${size}}(\s|$)`, 'g')));
};

export const findCustomer = async doc => {
  let customer;

  if (doc.customerPrimaryEmail) {
    customer = await models.Customers.findOne({
      $or: [
        { emails: { $in: [doc.customerPrimaryEmail] } },
        { primaryEmail: doc.customerPrimaryEmail }
      ]
    });
  }

  if (!customer && doc.customerPrimaryPhone) {
    customer = await models.Customers.findOne({
      $or: [
        { phones: { $in: [doc.customerPrimaryPhone] } },
        { primaryPhone: doc.customerPrimaryPhone }
      ]
    });
  }

  if (!customer && doc.customerCode) {
    customer = await models.Customers.findOne({ code: doc.customerCode });
  }

  return customer;
};

export const findCompany = async doc => {
  let company;

  if (doc.companyPrimaryName) {
    company = await models.Companies.findOne({
      $or: [
        { names: { $in: [doc.companyPrimaryName] } },
        { primaryName: doc.companyPrimaryName }
      ]
    });
  }

  if (!company && doc.name) {
    company = await models.Companies.findOne({
      $or: [{ names: { $in: [doc.name] } }, { primaryName: doc.name }]
    });
  }

  if (!company && doc.email) {
    company = await models.Companies.findOne({
      $or: [{ emails: { $in: [doc.email] } }, { primaryEmail: doc.email }]
    });
  }

  if (!company && doc.phone) {
    company = await models.Companies.findOne({
      $or: [{ phones: { $in: [doc.phone] } }, { primaryPhone: doc.phone }]
    });
  }

  if (!company && doc.companyPrimaryEmail) {
    company = await models.Companies.findOne({
      $or: [
        { emails: { $in: [doc.companyPrimaryEmail] } },
        { primaryEmail: doc.companyPrimaryEmail }
      ]
    });
  }

  if (!company && doc.companyPrimaryPhone) {
    company = await models.Companies.findOne({
      $or: [
        { phones: { $in: [doc.companyPrimaryPhone] } },
        { primaryPhone: doc.companyPrimaryPhone }
      ]
    });
  }

  if (!company && doc.companyCode) {
    company = await models.Companies.findOne({ code: doc.companyCode });
  }

  return company;
};

export const checkPremiumService = async type => {
  try {
    const domain = getEnv({ name: 'MAIN_APP_DOMAIN' })
      .replace('https://', '')
      .replace('http://', '');

    const response = await sendRequest({
      url: `${getCoreDomain()}/check-premium-service?domain=${domain}&type=${type}`,
      method: 'GET'
    });

    return response === 'yes';
  } catch (e) {
    return false;
  }
};

// board item number calculator
export const numberCalculator = (size: number, num?: any, skip?: boolean) => {
  if (num && !skip) {
    num = parseInt(num, 10) + 1;
  }

  if (skip) {
    num = 0;
  }

  num = num.toString();

  while (num.length < size) {
    num = '0' + num;
  }

  return num;
};

export const configReplacer = config => {
  const now = new Date();

  // replace type of date
  return config
    .replace(/\{year}/g, now.getFullYear().toString())
    .replace(/\{month}/g, (now.getMonth() + 1).toString())
    .replace(/\{day}/g, now.getDate().toString());
};
