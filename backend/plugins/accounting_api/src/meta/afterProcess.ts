import { AfterProcessConfigs, IAfterProcessRule } from 'erxes-api-shared/utils';
import { generateModels } from '~/connectionResolvers';
import { dealToTrs } from './afterProcessHandlers/dealToTrs';
import { dealToReturnTrs } from './afterProcessHandlers/dealToReturnTrs';
import { orderToTrs } from './afterProcessHandlers/orderToTrs';
import { orderToReturnTrs } from './afterProcessHandlers/orderToReturnTrs';

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
  {
    type: 'updatedDocument',
    contentTypes: ['sales:pos.orders'],
    when: {
      fieldsUpdated: ['status'],
    },
  },
  {
    type: 'createdDocument',
    contentTypes: ['sales:pos.orders'],
    when: {
      fieldsWith: ['status'],
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
              models,
              userId,
              deal: currentDocument,
              config: configReturn,
            });
          }
        }
        return;
      }

      if (contentType === 'sales:pos.orders') {
        const currentPosId = currentDocument.posId;
        if (currentPosId) {
          const configOrder = await models.Configs.getConfigValue(
            'syncOrder',
            currentPosId,
          );

          if (configOrder?.posId === currentPosId) {
            if (currentDocument.status === 'return') {
              await orderToReturnTrs({
                models,
                userId,
                order: currentDocument,
                config: configOrder,
              });
            } else {
              await orderToTrs({
                models,
                userId,
                order: currentDocument,
                config: configOrder,
              });
            }
          }
        }
      }
    })();
  },

  afterDocumentCreated: (ctx, input) => {
    (async () => {
      const { data } = input;

      const { subdomain } = ctx;
      const models = await generateModels(subdomain);

      const {
        collectionName,
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
        const currentStageId = currentDocument.stageId;

        if (currentStageId) {
          const configSale = await models.Configs.getConfigValue(
            'syncDeal',
            currentStageId,
          );

          if (configSale?.stageId === currentStageId) {
            await dealToTrs({
              subdomain,
              models,
              userId,
              deal: currentDocument,
              config: configSale,
            });
          }
        }
        return;
      }
      if (contentType === 'sales:pos.orders') {
        const currentPosId = currentDocument.posId;
        if (currentPosId) {
          const configOrder = await models.Configs.getConfigValue(
            'syncOrder',
            currentPosId,
          );

          if (configOrder?.posId === currentPosId) {
            await orderToTrs({
              models,
              userId,
              order: currentDocument,
              config: configOrder,
            });
          }
        }
      }
    })();
  },
};
