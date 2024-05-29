import {
  putCreateLog as commonPutCreateLog,
  putUpdateLog as commonPutUpdateLog,
  putDeleteLog as commonPutDeleteLog,
} from '@erxes/api-utils/src/logUtils';

import { generateModels } from './connectionResolver';
import { sendContactsMessage } from './messageBroker';

export const putDeleteLog = async (subdomain: string, logDoc, user) => {
  await commonPutDeleteLog(
    subdomain,
    { ...logDoc, type: `calls:${logDoc.type}` },
    user,
  );
};

export const putUpdateLog = async (subdomain: string, logDoc, user) => {
  await commonPutUpdateLog(
    subdomain,
    { ...logDoc, type: `calls:${logDoc.type}` },
    user,
  );
};

export const putCreateLog = async (subdomain: string, logDoc, user) => {
  const created = await commonPutCreateLog(
    subdomain,
    { ...logDoc, type: `calls:${logDoc.type}` },
    user,
  );
};

export default {
  collectItems: async ({ subdomain, data }) => {
    const { contentId } = data;
    const customer = await sendContactsMessage({
      subdomain,
      action: 'customers.findOne',
      isRPC: true,
      data: {
        _id: contentId,
      },
    });

    if (!customer?.primaryPhone) {
      return {
        status: 'success',
        data: [],
      };
    }

    const models = await generateModels(subdomain);
    const histories = await models.CallHistory.find({
      customerPhone: customer.primaryPhone,
    });

    const results: any = [];
    for (const history of histories) {
      results.push({
        _id: history._id,
        contentType: 'calls:customer',
        createdAt: history.createdAt,
        contentTypeDetail: history,
      });
    }

    return {
      status: 'success',
      data: results,
    };
  },
};
