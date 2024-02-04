import { IModels } from '../connectionResolver';

export const actionCreateComment = async (
  models: IModels,
  subdomain,
  action,
  execution,
) => {
  return null;
};

export const checkCommentTrigger = (subdomain, { target, config }) => {
  console.log({ target, config });

  return false;
};
