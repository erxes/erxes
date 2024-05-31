import { IUserDocument } from '@erxes/api-utils/src/types';
import { generateModels, IModels } from './connectionResolver';
import { IMPORT_EXPORT_TYPES } from './constants';
import {
  fetchSegment,
  sendCoreMessage,
  sendTagsMessage,
} from './messageBroker';
import * as moment from 'moment';

const prepareData = async (
  models: IModels,
  subdomain: string,
  query: any,
): Promise<any[]> => {
  const { segmentData, page, perPage } = query;

  const skip = (page - 1) * perPage;

  let data: any[] = [];

  const conversationsFilter: any = {};

  if (segmentData.conditions) {
    const itemIds = await fetchSegment(
      subdomain,
      '',
      { page, perPage },
      segmentData,
    );

    conversationsFilter._id = { $in: itemIds };
  }

  if (!segmentData) {
    data = await models.Conversations.find(conversationsFilter)
      .skip(skip)
      .limit(perPage)
      .lean();
  }

  data = await models.Conversations.find(conversationsFilter).lean();

  return data;
};

const prepareDataCount = async (
  models: IModels,
  subdomain: string,
  query: any,
): Promise<any> => {
  const { segmentData } = query;

  let data = 0;

  const conversationsFilter: any = {};

  if (segmentData.conditions) {
    const itemIds = await fetchSegment(
      subdomain,
      '',
      { scroll: true, page: 1, perPage: 10000 },
      segmentData,
    );

    conversationsFilter._id = { $in: itemIds };
  }

  data = await models.Conversations.find(conversationsFilter).countDocuments();

  return data;
};

export const fillValue = async (
  models: IModels,
  subdomain: string,
  column: string,
  item: any,
): Promise<string> => {
  let value = item[column];
  switch (column) {
    case 'createdAt':
      value = moment(value).format('YYYY-MM-DD');

      break;

    case 'updatedAt':
      value = moment(value).format('YYYY-MM-DD');

      break;

    case 'closedAt':
      value = moment(value).format('YYYY-MM-DD');

      break;

    case 'firstRespondedDate':
      value = moment(value).format('YYYY-MM-DD');

      break;

    case 'messageCount':
      value = item.messageCount || 0;

      break;

    case 'assignedUserId':
      const assignedUser: IUserDocument | null = await sendCoreMessage({
        subdomain,
        action: 'users.findOne',
        data: {
          _id: item.assignedUserId,
        },
        isRPC: true,
      });

      value = assignedUser ? assignedUser.username : 'user not found';

      break;

    case 'closedUserId':
      const closedUser: IUserDocument | null = await sendCoreMessage({
        subdomain,
        action: 'users.findOne',
        data: {
          _id: item.closedUserId,
        },
        isRPC: true,
      });

      value = closedUser ? closedUser.username : 'user not found';

      break;

    case 'isCustomerRespondedLast':
      value = item.isCustomerRespondedLast ? 'true' : 'false';

      break;

    case 'participatedUserIds':
      const resultValues = [] as any;

      for (const userId of item.participatedUserIds) {
        const participatedUser: IUserDocument | null = await sendCoreMessage({
          subdomain,
          action: 'users.findOne',
          data: {
            _id: userId,
          },
          isRPC: true,
        });

        resultValues.push(participatedUser ? participatedUser.username : '');
      }

      value = (resultValues ? resultValues : []).join(', ');

      break;

    case 'tag':
      const tags = await sendTagsMessage({
        subdomain,
        action: 'find',
        data: {
          _id: { $in: item.tagIds || [] },
        },
        isRPC: true,
        defaultValue: [],
      });

      let tagNames = '';

      for (const tag of tags) {
        tagNames = tagNames.concat(tag.name, ', ');
      }

      value = tags ? tagNames : '-';

      break;

    default:
      break;
  }

  return value || '-';
};

export default {
  importExportTypes: IMPORT_EXPORT_TYPES,

  prepareExportData: async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    const { columnsConfig } = data;

    let totalCount = 0;
    const headers = [] as any;
    const excelHeader = [] as any;

    try {
      const results = await prepareDataCount(models, subdomain, data);

      totalCount = results;

      for (const column of columnsConfig) {
        headers.push(column);
      }

      for (const header of headers) {
        excelHeader.push(header);
      }
    } catch (e) {
      return {
        error: e.message,
      };
    }
    return { totalCount, excelHeader };
  },

  getExportDocs: async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    const { columnsConfig } = data;

    const docs = [] as any;
    const headers = [] as any;

    try {
      const results = await prepareData(models, subdomain, data);

      for (const column of columnsConfig) {
        headers.push(column);
      }

      for (const item of results) {
        const result = {};

        for (const column of headers) {
          const value = await fillValue(models, subdomain, column, item);

          result[column] = value || '-';
        }

        docs.push(result);
      }
    } catch (e) {
      return { error: e.message };
    }
    return { docs };
  },
};
