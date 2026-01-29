import { AfterProcessConfigs, IAfterProcessRule, sendTRPCMessage } from 'erxes-api-shared/utils';
import { generateModels } from '~/connectionResolvers';
import { dealToTrs } from './afterProcessHandlers/dealToTrs';

const allRules: IAfterProcessRule[] = [
  {
    type: 'updatedDocument',
    contentTypes: ['sales:sales.deals'],
    when: {
      fieldsUpdated: ['stageId']
    }
  },
  {
    type: 'createdDocument',
    contentTypes: ['sales:sales.deals'],
    when: {
      fieldsWith: ['stageId']
    }
  },
];

export const afterProcess: AfterProcessConfigs = {
  rules: allRules,
  afterDocumentUpdated: async (ctx, input) => {
    const { data } = input;
    const { subdomain, processId } = ctx;
    const models = await generateModels(subdomain);
    const { collectionName, updateDescription, userId, contentType, docId, prevDocument, currentDocument } = data;

    if (contentType === 'sales:sales.deals' && collectionName === 'deals' && docId) {
      const { updated: updatedFields, added: addedFields } = updateDescription;

      const changedData = { ...addedFields, ...updatedFields };
      const changeDataStageId = changedData.stageId;

      if (changeDataStageId) {
        const { prev: prevStageId, current: currentStageId } = changeDataStageId;
        const config = await models.Configs.getConfigValue('syncDeal', currentStageId);
        if (prevStageId !== currentStageId && config?.stageId === currentStageId) {
          const user = await sendTRPCMessage({
            subdomain,
            pluginName: 'core',
            module: 'users',
            action: 'findOne',
            input: { query: { _id: userId } }
          });
          await dealToTrs({ subdomain, models, user, deal: currentDocument, config })
        }
      }
    }
  },
  afterDocumentCreated: (ctx, input) => { },
};
