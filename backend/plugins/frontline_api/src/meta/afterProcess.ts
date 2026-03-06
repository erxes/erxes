import {
  AfterProcessConfigs,
  AfterProcessModules,
} from 'erxes-api-shared/utils';
import { generateModels, IModels } from '~/connectionResolvers';
import { inboxAfterProcessWorkers } from '@/inbox/meta/afterProcess';
import { facebookAfterProcessWorkers } from '@/integrations/facebook/meta/afterProcess/afterProcessWorkers';
import {
  createAfterDocumentCreatedHandler,
  createAfterDocumentUpdatedHandler,
} from './afterProcess/handlers';

const afterProcessModules: AfterProcessModules<IModels> = {
  facebook: facebookAfterProcessWorkers,
  inbox: inboxAfterProcessWorkers,
};

const allRules = [
  ...facebookAfterProcessWorkers.rules,
  ...inboxAfterProcessWorkers.rules,
];

export const afterProcess: AfterProcessConfigs = {
  rules: allRules,
  afterDocumentCreated: createAfterDocumentCreatedHandler(afterProcessModules),
  afterDocumentUpdated: createAfterDocumentUpdatedHandler(afterProcessModules),
};
