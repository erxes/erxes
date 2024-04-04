import { replacePlaceHolders } from '@erxes/api-utils/src/automations';
import { IModels, generateModels } from './connectionResolver';
import { sendSegmentsMessage } from './messageBroker';

const generateSegmentFilter = async (subdomain, segment) => {
  const segmentIds = segment.conditions.map(cond => cond.subSegmentId);

  const segments = await sendSegmentsMessage({
    subdomain,
    action: 'find',
    data: { _id: { $in: segmentIds } },
    isRPC: true
  });

  let productIds: string[] = [];

  for (const { conditions } of segments) {
    for (const {
      propertyName,
      propertyOperator,
      propertyValue
    } of conditions) {
      if (propertyName.includes('productId') && propertyOperator === 'e') {
        productIds = [...productIds, propertyValue];
      }
    }
  }
  return productIds;
};

const getRelatedValue = async (
  models: IModels,
  subdomain: string,
  target,
  targetKey,
  relatedValueProps
) => {
  if (targetKey === 'items.count') {
    let totalCount = 0;

    const { execution } = relatedValueProps;
    const { triggerConfig } = execution;
    let { items = [] } = target;

    const segment = await sendSegmentsMessage({
      subdomain,
      action: 'findOne',
      data: { _id: triggerConfig?.contentId },
      isRPC: true
    });

    const productIds = await generateSegmentFilter(subdomain, segment);

    if (productIds.length > 0) {
      items = items.filter(item => productIds.includes(item.productId));
    }

    for (const item of items) {
      totalCount += item?.count || 0;
    }

    return totalCount;
  }

  return null;
};

export default {
  constants: {
    triggers: [
      {
        type: 'pos:posOrder',
        img: 'automation3.svg',
        icon: 'lamp',
        label: 'Pos order',
        description:
          'Start with a blank workflow that enralls and is triggered off Pos orders'
      }
    ]
  },

  replacePlaceHolders: async ({
    subdomain,
    data: { target, config, execution }
  }) => {
    const models = generateModels(subdomain);

    const value = await replacePlaceHolders({
      models,
      subdomain,
      getRelatedValue,
      actionData: config,
      target,
      relatedValueProps: { execution },
      complexFields: ['items']
    });

    return value;
  }
};
