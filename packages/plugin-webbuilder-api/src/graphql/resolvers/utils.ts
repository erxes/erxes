import { resolve } from 'path';
import * as fse from 'fs-extra';
import { IModels } from '../../connectionResolver';

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
    if (entry.contentTypeId !== oldContentTypeId) {
      return;
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
    type.code === type.code + '_entry';

    if (type.code !== pageName) {
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
