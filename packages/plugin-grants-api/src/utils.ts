import { generateModels } from './connectionResolver';
import { sendCardsMessage, sendCommonMessage } from './messageBroker';

export async function doAction(
  subdomain,
  serviceName,
  action,
  requestId,
  params,
  user
) {
  const data = {
    action,
    requestId,
    ...JSON.parse(params || '{}'),
    user,
    processId: Math.random()
  };

  if (action === 'changeStage') {
    await sendCardsMessage({
      subdomain,
      action: 'editItem',
      data,
      isRPC: true
    });
    return 'success';
  }

  if (action === 'changeCardType') {
    await sendCardsMessage({
      subdomain,
      action: 'createRelatedItem',
      data,
      isRPC: true
    });

    return 'success';
  }

  await sendCommonMessage({
    subdomain,
    serviceName,
    action: 'grants',
    data
  });
}

export const doLogicAfterAction = async (
  subdomain,
  requestId,
  params,
  user
) => {
  const { logics, itemId, sourceType } = JSON.parse(params || '{}');

  if (!!logics?.length) {
    const models = await generateModels(subdomain);
    const grant = await models.Requests.findOne({ _id: requestId });

    const logic = await logics.find(logic => logic?.logic === grant?.status);

    if (logic) {
      const doc = {
        itemId,
        type: sourceType,
        user: user,
        processId: Math.random(),
        stageId: logic?.targetStageId
      };

      await sendCardsMessage({
        subdomain,
        action: 'editItem',
        data: doc,
        isRPC: true
      });
    }
  }
};
