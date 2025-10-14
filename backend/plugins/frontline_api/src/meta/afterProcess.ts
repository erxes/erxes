import { splitType } from 'erxes-api-shared/core-modules';
import { AfterProcessConfigs, IAfterProcessRule } from 'erxes-api-shared/utils';
import { generateModels, IModels } from '~/connectionResolvers';
import { inboxAfterProcessWorkers } from '@/inbox/meta/afterProcess';
import { debugError } from '@/inbox/utils';
import { IFacebookIntegrationDocument } from '@/integrations/facebook/@types/integrations';
import { facebookAfterProcessWorkers } from '@/integrations/facebook/meta/afterProcess/afterProcessWorkers';

type AfterProcessConfig = {
  [key: string]: {
    rules: IAfterProcessRule[];
    createdDocument?: {
      [key: string]: (models: IModels, data: any) => Promise<void>;
    };
    updatedDocument?: {
      [key: string]: (...args: any[]) => Promise<void>;
    };
  };
};

const afterProcessModules: AfterProcessConfig = {
  facebook: facebookAfterProcessWorkers,
  inbox: inboxAfterProcessWorkers,
};

export const afterProcess = {
  rules: [
    ...facebookAfterProcessWorkers.rules,
    ...inboxAfterProcessWorkers.rules,
  ],
  onDocumentCreated: async ({ subdomain }, { contentType, ...data }) => {
    const models = await generateModels(subdomain);
    const [_, moduleName, collectionType] = splitType(contentType);

    const handler =
      afterProcessModules[moduleName]?.createdDocument?.[collectionType];
    if (handler) {
      await handler(models, data);
    }
  },
  onDocumentUpdated: async ({ subdomain }, { contentType, ...data }) => {
    const models = await generateModels(subdomain);

    const [_, moduleName, collectionType] = splitType(contentType);

    try {
      const handler =
        afterProcessModules[moduleName]?.updatedDocument?.[collectionType];
      if (handler) {
        try {
          await handler(subdomain, models, data);
        } catch (err) {
          debugError(`Error in afterProcess for ${contentType}:`, err);
        }
      } else {
        debugError(`No afterProcess handler for ${contentType}`);
      }
    } catch (error) {
      debugError(error.message);
    }
  },
} as AfterProcessConfigs;
