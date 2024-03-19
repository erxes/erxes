import { IModels, generateModels } from '../connectionResolver';
import { checkContentConditions } from './utils';

export const actionCreateComment = async (
  models: IModels,
  subdomain,
  action,
  execution,
) => {
  return null;
};

export const checkCommentTrigger = async (subdomain, { target, config }) => {
  const { botId, postId, postType, checkContent, conditions, onlyFirstLevel } =
    config || {};

  const models = await generateModels(subdomain);

  const bot = await models.Bots.find({
    _id: botId,
    pageId: target?.recipientId,
  });

  if (!bot) {
    return;
  }

  if (postType === 'specific' && target.postId !== postId) {
    return;
  }

  if (onlyFirstLevel && !!target?.parentId) {
    return;
  }

  if (!checkContent) {
    return true;
  }

  if (checkContentConditions(target?.content || '', conditions)) {
    return true;
  }

  return false;
};
