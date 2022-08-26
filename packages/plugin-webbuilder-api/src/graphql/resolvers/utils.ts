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

export const getInitialData = async (fileName: string) => {
  return fse.readJSON(filePath(`../src/initialData/${fileName}.json`));
};

const createSiteEntries = async (
  models: IModels,
  oldContentTypeId: string,
  contentTypeId: string
) => {
  const entries = await getInitialData('entries');

  for (const entry of entries) {
    if (entry.contentTypeId !== oldContentTypeId['$oid']) {
      continue;
    }

    models.Entries.createEntry({
      values: entry.values,
      contentTypeId
    });
  }
};

export const createSiteContentTypes = async (
  models: IModels,
  { pageName, siteId }: { pageName; siteId }
) => {
  const contentTypes = await getInitialData('contentTypes');

  for (const type of contentTypes) {
    const code = type.code + '_entry';

    if (code !== pageName) {
      continue;
    }

    const contentType = await models.ContentTypes.createContentType({
      ...type,
      _id: undefined,
      siteId: siteId
    });

    await createSiteEntries(models, type._id, contentType._id);
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

export const readAndWriteHelpersData = async (fileName: string) => {
  const url = `https://helper.erxes.io/get-webbuilder-${fileName}`;
  const output = `../src/initialData/${fileName}.json`;

  return execCommand(`curl -L ${url} --output ${output}`);
};
