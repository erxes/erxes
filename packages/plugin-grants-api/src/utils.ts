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

  if (action === 'createRelatedCard') {
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

export async function checkConfig({
  subdomain,
  scope,
  action,
  contentType,
  contentTypeId
}) {
  const models = await generateModels(subdomain);
  let fieldName = ``;

  const configIds = await models.Configs.find({
    scope,
    action,
    config: { $regex: new RegExp(`.*"type":"${contentType}".*`) }
  }).distinct('_id');

  if (scope === 'cards') {
    contentType = `${contentType}s`;
    fieldName = 'stageId';
  }

  const detail = await sendCommonMessage({
    subdomain,
    serviceName: scope,
    action: `${contentType}.findOne`,
    data: { _id: contentTypeId },
    isRPC: true,
    defaultValue: null
  });

  if (!detail) {
    return null;
  }

  const config = await models.Configs.findOne({
    _id: { $in: configIds },
    config: { $regex: `.*"${fieldName}":"${detail[fieldName]}".*` }
  }).sort({ createdAt: -1 });

  if (config) {
    const params = JSON.parse(config.params || '{}');
    for (const [key, value] of Object.entries(params)) {
      if (typeof value === 'string') {
        if (value.match(/^{{ .* }}$/)) {
          params[key] = detail[value.replace(/{{ | }}/g, '')];
        }
      }
    }
    config.params = JSON.stringify(params);
  }

  return config;
}
