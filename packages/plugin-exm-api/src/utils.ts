import EditorAttributeUtil from '@erxes/api-utils/src/editorAttributeUtils';

import { debugBase, debugError } from './debuggers';
import messageBroker from './messageBroker';
import { getServices, getService } from './redis';
import { ICampaign, ICustomer } from './types';

export const isUsingElk = () => {
  const ELK_SYNCER = getEnv({ name: 'ELK_SYNCER', defaultValue: 'true' });

  return ELK_SYNCER === 'false' ? false : true;
};

export interface IUser {
  name: string;
  position: string;
  email: string;
}

interface ICustomerAnalyzeParams {
  customers: ICustomer[];
  engageMessageId: string;
}

export const getEnv = ({
  name,
  defaultValue
}: {
  name: string;
  defaultValue?: string;
}): string => {
  const value = process.env[name];

  if (!value && typeof defaultValue !== 'undefined') {
    return defaultValue;
  }

  if (!value) {
    debugBase(`Missing environment variable configuration for ${name}`);
  }

  return value || '';
};

export const routeErrorHandling = (fn, callback?: any) => {
  return async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (e) {
      debugError(e.message);

      if (callback) {
        return callback(res, e);
      }

      return next(e);
    }
  };
};

export const setCampaignCount = async (campaign: ICampaign) => {
  await messageBroker().sendMessage('engagesNotification', {
    action: 'setCampaignCount',
    data: {
      campaignId: campaign._id,
      totalCustomersCount: campaign.totalCustomersCount,
      validCustomersCount: campaign.validCustomersCount
    }
  });
};

export const getEditorAttributeUtil = async () => {
  const apiCore = await getService('core');
  const services = await getServices();
  const editor = await new EditorAttributeUtil(
    messageBroker(),
    apiCore.address,
    services
  );

  return editor;
};
