import { AfterProcessConfigs, IAfterProcessRule } from 'erxes-api-shared/utils';
import { generateModels } from '~/connectionResolvers';
import { dealToTrs } from './afterProcessHandlers/dealToTrs';
import { dealToReturnTrs } from './afterProcessHandlers/dealToReturnTrs';

const allRules: IAfterProcessRule[] = [
  {
    type: 'updatedDocument',
    contentTypes: ['sales:sales.deals'],
    when: {
      fieldsUpdated: ['stageId'],
    },
  },
  {
    type: 'createdDocument',
    contentTypes: ['sales:sales.deals'],
    when: {
      fieldsWith: ['stageId'],
    },
  },
];

export const afterProcess: AfterProcessConfigs = {
  rules: allRules,
  afterDocumentUpdated: (ctx, input) => {
    (async () => {
      const { data } = input;

      const { subdomain } = ctx;
      const models = await generateModels(subdomain);
      const {
        collectionName,
        updateDescription,
        userId,
        contentType,
        docId,
        currentDocument,
      } = data;

      if (
        contentType === 'sales:sales.deals' &&
        collectionName === 'deals' &&
        docId
      ) {
        const { updated: updatedFields, added: addedFields } =
          updateDescription;

        const changedData = { ...addedFields, ...updatedFields };
        const changeDataStageId = changedData.stageId;

        if (changeDataStageId) {
          const { prev: prevStageId, current: currentStageId } =
            changeDataStageId;
          const configSale = await models.Configs.getConfigValue(
            'syncDeal',
            currentStageId,
          );
          const configReturn = await models.Configs.getConfigValue(
            'syncDealReturn',
            currentStageId,
          );

          if (prevStageId === currentStageId) {
            return;
          }

          if (configSale?.stageId === currentStageId) {
            await dealToTrs({
              subdomain,
              models,
              userId,
              deal: currentDocument,
              config: configSale,
            });
          }
          if (configReturn?.stageId === currentStageId) {
            await dealToReturnTrs({
              subdomain,
              models,
              userId,
              deal: currentDocument,
              config: configReturn,
            });
          }
        }
      }
    })();
  },
  // afterDocumentCreated: (ctx, input) => { },
};
