import { sendRequest } from '@erxes/api-utils/src';
import { IModels } from '../../connectionResolver';

const createSiteEntries = async (
  models: IModels,
  entries: any,
  contentTypeId: string,
  userId: string
) => {
  for (const entry of entries) {
    models.Entries.createEntry(
      {
        values: entry.values,
        contentTypeId
      },
      userId
    );
  }
};

export const createSiteContentTypes = async (
  models: IModels,
  {
    siteId,
    contentTypes,
    entriesAll,
    userId
  }: {
    siteId: string;
    contentTypes: any;
    entriesAll: any;
    userId: string;
  }
) => {
  for (const type of contentTypes) {
    const contentType = await models.ContentTypes.createContentType(
      {
        ...type,
        _id: undefined,
        siteId: siteId
      },
      userId
    );

    // find entries related to contentType
    const entries = entriesAll.filter(
      entry => entry.contentTypeId === type._id['$oid']
    );

    if (!entries.length) {
      continue;
    }

    await createSiteEntries(models, entries, contentType._id, userId);
  }
};

export const writeAndReadHelpersData = async (
  fileName: string,
  query: string = ''
) => {
  const HELPERS_DOMAIN = `https://helper.erxes.io`;

  const url = `${HELPERS_DOMAIN}/get-webbuilder-${fileName}?${query}`;

  return sendRequest({
    url,
    method: 'get'
  });
};
