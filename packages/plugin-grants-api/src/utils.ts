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
      action: 'changeStage',
      data,
      isRPC: true
    });
    return 'success';
  }

  if (action === 'changeCardType') {
    const models = await generateModels(subdomain);

    const { logics, itemId, sourceType } = data;

    await sendCardsMessage({
      subdomain,
      action: 'createRelatedItem',
      data,
      isRPC: true
    });
    if (!!logics?.length) {
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
          data: {
            doc
          }
        });
      }
    }

    return 'success';
  }

  await sendCommonMessage({
    subdomain,
    serviceName,
    action: 'grants',
    data
  });
}
