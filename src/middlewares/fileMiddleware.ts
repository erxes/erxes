import * as formidable from 'formidable';
import * as fs from 'fs';
import * as request from 'request';
import * as _ from 'underscore';
import * as xlsxPopulate from 'xlsx-populate';
import { RABBITMQ_QUEUES } from '../data/constants';
import { can } from '../data/permissions/utils';
import { checkFile, frontendEnv, getSubServiceDomain, uploadFile } from '../data/utils';
import { debugExternalApi } from '../debuggers';
import { sendRPCMessage } from '../messageBroker';

const readXlsFile = async (file): Promise<{ fieldNames: string[]; usedSheets: any[] }> => {
  return new Promise(async (resolve, reject) => {
    const readStream = fs.createReadStream(file.path);

    // Directory to save file
    const downloadDir = `${__dirname}/../private/xlsTemplateOutputs/${file.name}`;

    // Converting pipe into promise
    const pipe = stream =>
      new Promise((resolver, rejecter) => {
        stream.on('finish', resolver);
        stream.on('error', rejecter);
      });

    // Creating streams
    const writeStream = fs.createWriteStream(downloadDir);
    const streamObj = await readStream.pipe(writeStream);

    pipe(streamObj)
      .then(async () => {
        // After finished saving instantly create and load workbook from xls
        const workbook = await xlsxPopulate.fromFileAsync(downloadDir);

        // Deleting file after read
        fs.unlink(downloadDir, () => {
          return true;
        });

        const usedRange = workbook.sheet(0).usedRange();

        if (!usedRange) {
          return reject(new Error('Invalid file'));
        }

        const usedSheets = usedRange.value();
        const compactedRows: any[] = [];

        for (const row of usedSheets) {
          // to prevent empty data entry since xlsPopulate returns empty cells
          const compactRow = _.compact(row);

          if (compactRow.length > 0) {
            compactedRows.push(row);
          }
        }

        // Getting columns
        const fieldNames = usedSheets[0];

        // Removing column
        compactedRows.shift();

        return resolve({ fieldNames, usedSheets: compactedRows });
      })
      .catch(e => {
        return reject(e);
      });
  });
};

export const importer = async (req: any, res, next) => {
  if (!(await can('importXlsFile', req.user))) {
    return next(new Error('Permission denied!'));
  }

  try {
    const scopeBrandIds = JSON.parse(req.cookies.scopeBrandIds || '[]');
    const form = new formidable.IncomingForm();

    form.parse(req, async (_err, fields: any, response) => {
      let status = '';

      try {
        status = await checkFile(response.file);
      } catch (e) {
        return res.json({ status: e.message });
      }

      // if file is not ok then send error
      if (status !== 'ok') {
        return res.json({ status });
      }

      try {
        const { fieldNames, usedSheets } = await readXlsFile(response.file);

        const result = await sendRPCMessage(RABBITMQ_QUEUES.RPC_API_TO_WORKERS, {
          action: 'createImport',
          type: fields.type,
          fieldNames,
          datas: usedSheets,
          scopeBrandIds,
          user: req.user,
        });

        return res.json(result);
      } catch (e) {
        return res.json({ status: 'error', message: e.message });
      }
    });
  } catch (e) {
    return res.json({ status: 'error', message: e.message });
  }
};

export const uploader = async (req: any, res, next) => {
  const INTEGRATIONS_API_DOMAIN = getSubServiceDomain({ name: 'INTEGRATIONS_API_DOMAIN' });

  if (req.query.kind === 'nylas') {
    debugExternalApi(`Pipeing request to ${INTEGRATIONS_API_DOMAIN}`);

    return req.pipe(
      request
        .post(`${INTEGRATIONS_API_DOMAIN}/nylas/upload`)
        .on('response', response => {
          if (response.statusCode !== 200) {
            return next(response.statusMessage);
          }

          return response.pipe(res);
        })
        .on('error', e => {
          debugExternalApi(`Error from pipe ${e.message}`);
          next(e);
        }),
    );
  }

  const form = new formidable.IncomingForm();

  form.parse(req, async (_error, _fields, response) => {
    const file = response.file || response.upload;

    // check file ====
    const status = await checkFile(file, req.headers.source);

    if (status === 'ok') {
      try {
        const result = await uploadFile(frontendEnv({ name: 'API_URL', req }), file, response.upload ? true : false);

        return res.send(result);
      } catch (e) {
        return res.status(500).send(filterXSS(e.message));
      }
    }

    return res.status(500).send(status);
  });
};
