import {
  AfterProcessConfigs,
  IAfterProcessRule,
  sendTRPCMessage,
} from 'erxes-api-shared/utils';
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
      fieldsUpdated: ['status', 'cashAmount', 'mobileAmount', 'paidAmounts'],
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

const getErrorMessage = (error: any) =>
  error?.message || error?.errorMessage || `${error}`;

const logAfterProcessError = (error: any) => {
  console.error('[accounting afterProcess]', getErrorMessage(error));
};

const setDealAccountingResponse = async ({
  subdomain,
  dealId,
  responseFieldId,
  message,
  userId,
}: {
  subdomain: string;
  dealId: string;
  responseFieldId?: string;
  message: string;
  userId?: string;
}) => {
  if (!responseFieldId) {
    return;
  }

  try {
    await sendTRPCMessage({
      subdomain,
      pluginName: 'sales',
      method: 'mutation',
      module: 'deal',
      action: 'updateOne',
      input: {
        selector: { _id: dealId },
        modifier: {
          $set: {
            [`propertiesData.${responseFieldId}`]: message,
          },
        },
      },
      context: { userId },
    });
  } catch (e) {
    logAfterProcessError(e);
  }
};

const setOrderAccountingResponse = async ({
  subdomain,
  orderId,
  message,
}: {
  subdomain: string;
  orderId: string;
  message: string;
}) => {
  try {
    await sendTRPCMessage({
      subdomain,
      method: 'mutation',
      pluginName: 'sales',
      module: 'order',
      action: 'updateOne',
      input: {
        selector: { _id: orderId },
        modifier: { accountingResponse: message },
      },
    });
  } catch (e) {
    logAfterProcessError(e);
  }
};

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
            try {
              await dealToTrs({
                subdomain,
                models,
                userId,
                deal: currentDocument,
                config: configSale,
              });
              await setDealAccountingResponse({
                subdomain,
                dealId: currentDocument._id,
                responseFieldId: configSale.responseFieldId,
                message: 'success',
                userId,
              });
            } catch (e) {
              await setDealAccountingResponse({
                subdomain,
                dealId: currentDocument._id,
                responseFieldId: configSale.responseFieldId,
                message: getErrorMessage(e),
                userId,
              });
            }
          }
          if (configReturn?.stageId === currentStageId) {
            try {
              await dealToReturnTrs({
                models,
                userId,
                deal: currentDocument,
                config: configReturn,
              });
              await setDealAccountingResponse({
                subdomain,
                dealId: currentDocument._id,
                responseFieldId: configReturn.responseFieldId,
                message: 'success',
                userId,
              });
            } catch (e) {
              await setDealAccountingResponse({
                subdomain,
                dealId: currentDocument._id,
                responseFieldId: configReturn.responseFieldId,
                message: getErrorMessage(e),
                userId,
              });
            }
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
            try {
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
              await setOrderAccountingResponse({
                subdomain,
                orderId: currentDocument._id,
                message: 'success',
              });
            } catch (e) {
              await setOrderAccountingResponse({
                subdomain,
                orderId: currentDocument._id,
                message: getErrorMessage(e),
              });
            }
          }
        }
      }
    })().catch(logAfterProcessError);
  },

  afterDocumentCreated: (ctx, input) => {
    (async () => {
      const { data } = input;

      const { subdomain } = ctx;
      const models = await generateModels(subdomain);

      const { collectionName, userId, contentType, docId, currentDocument } =
        data;

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
            try {
              await dealToTrs({
                subdomain,
                models,
                userId,
                deal: currentDocument,
                config: configSale,
              });
              await setDealAccountingResponse({
                subdomain,
                dealId: currentDocument._id,
                responseFieldId: configSale.responseFieldId,
                message: 'success',
                userId,
              });
            } catch (e) {
              await setDealAccountingResponse({
                subdomain,
                dealId: currentDocument._id,
                responseFieldId: configSale.responseFieldId,
                message: getErrorMessage(e),
                userId,
              });
            }
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
            try {
              await orderToTrs({
                models,
                userId,
                order: currentDocument,
                config: configOrder,
              });
              await setOrderAccountingResponse({
                subdomain,
                orderId: currentDocument._id,
                message: 'success',
              });
            } catch (e) {
              await setOrderAccountingResponse({
                subdomain,
                orderId: currentDocument._id,
                message: getErrorMessage(e),
              });
            }
          }
        }
      }
    })().catch(logAfterProcessError);
  },
};
