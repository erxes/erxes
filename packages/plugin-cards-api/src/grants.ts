import { generateModels } from './connectionResolver';
import { itemsEdit } from './graphql/resolvers/mutations/utils';
import { sendCommonMessage } from './messageBroker';
import { sendCoreMessage } from './messageBroker';
import { createBoardItem } from './models/utils';

const changeStage = async ({ subdomain, data }) => {
  const models = await generateModels(subdomain);

  const objModels = {
    ticket: models.Tickets,
    task: models.Tasks,
    deal: models.Deals
  };

  const { itemId, processId, type, user, ...doc } = data;
  if (!itemId || !type || !user || !processId) {
    return null;
  }
  const collection = objModels[type];

  const oldItem = await collection.findOne({ _id: itemId });
  const typeUpperCase = type.charAt(0).toUpperCase() + type.slice(1);
  return await itemsEdit(
    models,
    subdomain,
    itemId,
    type,
    oldItem,
    doc,
    processId,
    user,
    collection[`update${typeUpperCase}`]
  );
};
const changeCardType = async ({ subdomain, data }) => {
  const models = await generateModels(subdomain);

  const { type, sourceType, itemId, name, stageId, logics } = data;

  const relatedCard = await createBoardItem(
    models,
    subdomain,
    { name, stageId },
    type
  );

  await sendCoreMessage({
    subdomain,
    action: 'conformities.addConformity',
    data: {
      mainType: sourceType,
      mainTypeId: itemId,
      relType: type,
      relTypeId: relatedCard._id
    }
  });

  if (!!logics?.length) {
    const grant = await sendCommonMessage({
      subdomain,
      serviceName: 'grants',
      action: 'requests.findOne',
      data: {
        _id: data.requesterId
      },
      isRPC: true
    });

    const logic = await logics.find(logic => logic?.logic === grant?.status);

    if (logic) {
      const doc = {
        itemId,
        type: sourceType,
        user: data.user,
        processId: Math.random(),
        stageId: logic?.targetStageId
      };

      await changeStage({ subdomain, data: doc });
    }
  }

  return '';
};

export default {
  actions: [
    {
      label: 'Change Stage',
      action: 'changeStage',
      type: 'card'
    },
    {
      label: 'Change Card Type',
      action: 'changeCardType',
      type: 'card'
    }
  ],
  handlers: async ({ subdomain, data }) => {
    switch (data.action) {
      case 'changeCardType':
        return await changeCardType({ subdomain, data });
      case 'changeStage':
        return await changeStage({ subdomain, data });
      default:
        break;
    }
  }
};
