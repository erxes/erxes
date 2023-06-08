import { IModels } from '../connectionResolver';
import { sendCardsMessage } from '../messageBroker';
import { sendNotification } from '../utils';

export const cardUpdateHandler = async (models: IModels, subdomain, params) => {
  const { type, object } = params;

  const cardType = type.split(':')[1];

  const prevStageId = object.stageId;
  const card = params.updatedDocument;
  const oldCard = params.object;
  const destinationStageId = card.stageId || '';

  const oldStatus = oldCard.status;
  const newStatus = card.status;

  let content = '';

  if (
    !(destinationStageId && destinationStageId !== oldCard.stageId) &&
    oldStatus === newStatus
  ) {
    return;
  }

  const userIds = await models.ClientPortalUserCards.getUserIds(
    cardType,
    card._id
  );

  if (userIds.length === 0) {
    return;
  }

  const stage = await sendCardsMessage({
    subdomain,
    action: 'stages.findOne',
    data: { _id: destinationStageId },
    isRPC: true,
    defaultValue: null
  });

  const prevStage = await sendCardsMessage({
    subdomain,
    action: 'stages.findOne',
    data: { _id: prevStageId },
    isRPC: true,
    defaultValue: null
  });

  content = `${cardType.charAt(0).toUpperCase() + cardType.slice(1)} ${
    card.name
  } has been moved from ${prevStage.name} to ${stage.name} stage`;

  if (newStatus !== oldStatus && newStatus === 'archived') {
    content = `Your ${cardType} named ${card.name} has been archived`;
  }

  if (newStatus !== oldStatus && newStatus === 'active') {
    content = `Your ${cardType} named ${card.name} has been activated`;
  }

  const users = await models.ClientPortalUsers.find({
    _id: { $in: userIds }
  }).lean();

  for (const user of users) {
    const config = await models.ClientPortals.findOne({
      _id: user.clientPortalId
    });

    if (!config) {
      continue;
    }

    await sendNotification(models, subdomain, {
      receivers: [user._id],
      title: `Your submitted ${cardType} has been updated`,
      content,
      notifType: 'system',
      link: `${config.url}/${cardType}s?stageId=${destinationStageId}`
    });
  }

  return;
};

export const cardDeleteHandler = async (models: IModels, subdomain, params) => {
  const { type } = params;

  const cardType = type.split(':')[1];

  const card = params.object;

  const userIds = await models.ClientPortalUserCards.getUserIds(
    cardType,
    card._id
  );

  await models.ClientPortalUserCards.remove({ cardId: card._id });

  if (userIds.length === 0) {
    return;
  }

  const users = await models.ClientPortalUsers.find({
    _id: { $in: userIds }
  }).lean();

  for (const user of users) {
    const config = await models.ClientPortals.findOne({
      _id: user.clientPortalId
    });

    if (!config) {
      continue;
    }

    await sendNotification(models, subdomain, {
      receivers: [user._id],
      title: `Your submitted ${cardType} has been deleted`,
      content: `${cardType.charAt(0).toUpperCase() + cardType.slice(1)} ${
        card.name
      } has been deleted`,
      notifType: 'system',
      link: `${config.url}/${cardType}s`
    });
  }

  return;
};
