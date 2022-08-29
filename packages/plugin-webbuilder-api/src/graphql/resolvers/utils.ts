import { resolve } from 'path';
import * as fse from 'fs-extra';
import { IModels } from '../../connectionResolver';
const exec = require('child_process').exec;

const filePath = pathName => {
  if (pathName) {
    return resolve(process.cwd(), pathName);
  }

  return resolve(process.cwd());
};

const createSiteEntries = async (
  models: IModels,
  entries: any,
  contentTypeId: string
) => {
  for (const entry of entries) {
    models.Entries.createEntry({
      values: entry.values,
      contentTypeId
    });
  }
};

export const createSiteContentTypes = async (
  models: IModels,
  {
    siteId,
    contentTypes,
    entriesAll
  }: {
    siteId: string;
    contentTypes: any;
    entriesAll: any;
  }
) => {
  for (const type of contentTypes) {
    const contentType = await models.ContentTypes.createContentType({
      ...type,
      _id: undefined,
      siteId: siteId
    });

    // find entries related to contentType
    const entries = entriesAll.filter(
      entry => entry.contentTypeId === type._id['$oid']
    );

    if (!entries.length) {
      continue;
    }

    await createSiteEntries(models, entries, contentType._id);
  }
};

const execCommand = (command, ignoreError?) => {
  return new Promise((resolve, reject) => {
    exec(command, { maxBuffer: 1024 * 1000 }, (error, stdout, stderr) => {
      if (error !== null) {
        if (ignoreError) {
          return resolve('done');
        }

        return reject(error);
      }

      console.log(stdout);
      console.log(stderr);

      return resolve('done');
    });
  });
};

export const writeAndReadHelpersData = async (fileName: string, query = '') => {
  const HELPERS_DOMAIN = `https://helper.erxes.io`;

  const url = `${HELPERS_DOMAIN}/get-webbuilder-${fileName}?${query}`;
  const output = `../src/initialData/${fileName}.json`;

  await execCommand(`curl -L ${url} --output ${output}`);

  return fse.readJSON(filePath(output));
};
