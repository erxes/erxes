import * as fs from 'fs';
import * as path from 'path';
import * as xlsxPopulate from 'xlsx-populate';
import { checkFieldNames } from '../data/modules/coc/utils';
import { can } from '../data/permissions/utils';
import { ImportHistory } from '../db/models';
import { IUserDocument } from '../db/models/definitions/users';
import { createWorkers, splitToCore } from './utils';

export const intervals: any[] = [];

/**
 * Receives and saves xls file in private/xlsImports folder
 * and imports customers to the database
 */
export const importXlsFile = async (
  file: any,
  type: string,
  { user, scopeBrandIds }: { scopeBrandIds: string[]; user: IUserDocument },
) => {
  return new Promise(async (resolve, reject) => {
    if (!(await can('importXlsFile', user))) {
      return reject(new Error('Permission denied!'));
    }

    const versionNumber = process.version
      .toString()
      .slice(1)
      .split('.')[0];

    if (Number(versionNumber) < 10) {
      return reject(new Error('Please upgrade node version above 10.5.0 support worker_threads!'));
    }

    const readStream = fs.createReadStream(path.basename(file.path));

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
    const streamObj = readStream.pipe(writeStream);

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

        // Getting columns
        const fieldNames = usedSheets[0];

        // Removing column
        usedSheets.shift();

        if (usedSheets.length === 0) {
          return reject(new Error('Please import more at least one row of data'));
        }

        const properties = await checkFieldNames(type, fieldNames);

        const importHistory = await ImportHistory.create({
          contentType: type,
          total: usedSheets.length,
          userId: user._id,
          date: Date.now(),
        });

        const results: string[] = splitToCore(usedSheets);

        const workerFile =
          process.env.NODE_ENV === 'production'
            ? `./dist/workers/bulkInsert.worker.js`
            : './src/workers/bulkInsert.worker.import.js';

        const workerPath = path.resolve(workerFile);

        const percentagePerData = Number(((1 / usedSheets.length) * 100).toFixed(3));

        const workerData = {
          scopeBrandIds,
          user,
          contentType: type,
          properties,
          importHistoryId: importHistory._id,
          percentagePerData,
        };

        await createWorkers(workerPath, workerData, results).catch(e => {
          return reject(e);
        });

        return resolve({ id: importHistory.id });
      })
      .catch(e => {
        return reject(e);
      });
  });
};
