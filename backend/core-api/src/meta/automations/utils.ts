import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { generateModels, IModels } from '~/connectionResolvers';
export const getRelatedValue = async (
  models: IModels,
  subdomain: string,
  target,
  targetKey,
) => {
  if (
    [
      'userId',
      'assignedUserId',
      'closedUserId',
      'ownerId',
      'createdBy',
    ].includes(targetKey)
  ) {
    const user = await models.Users.getUser(target[targetKey]);

    return (
      (user && ((user.details && user.details.fullName) || user.email)) || ''
    );
  }

  if (
    ['participatedUserIds', 'assignedUserIds', 'watchedUserIds'].includes(
      targetKey,
    )
  ) {
    const users = await models.Users.find({ _id: { $in: target[targetKey] } });

    return (
      users.map(
        (user) => (user.details && user.details.fullName) || user.email,
      ) || []
    ).join(', ');
  }

  if (targetKey === 'tagIds') {
    const tags = await sendTRPCMessage({
      subdomain,

      pluginName: 'core',
      method: 'query',
      module: 'tags',
      action: 'find',
      input: { _id: { $in: target[targetKey] } },
      defaultValue: [],
    });

    return (tags.map((tag) => tag.name) || []).join(', ');
  }

  return false;
};

export const getItems = async (
  subdomain: string,
  module: string,
  execution: any,
  targetType: string,
) => {
  const { target } = execution;

  if (module === targetType) {
    return [target];
  }

  const models = await generateModels(subdomain);

  let model: any = models.Customers;

  if (module.includes('company')) {
    model = models.Companies;
  }

  const [moduleService] = module.split(':');
  const [triggerService, triggerContentType] = targetType.split(':');

  if (
    triggerContentType !== 'form_submission' &&
    moduleService === triggerService
  ) {
    const relTypeIds = await sendTRPCMessage({
      subdomain,

      pluginName: 'core',
      method: 'query',
      module: 'conformity',
      action: 'savedConformity',
      input: {
        mainType: targetType.split(':')[1],
        mainTypeId: target._id,
        relTypes: [module.split(':')[1]],
      },
      defaultValue: [],
    });

    return model.find({ _id: { $in: relTypeIds } });
  }

  let filter = await sendTRPCMessage({
    subdomain,

    pluginName: triggerService,
    method: 'query',
    module: 'conformity',
    action: 'getModuleRelation',
    input: {
      mainType: targetType.split(':')[1],
      mainTypeId: target._id,
      relTypes: [module.split(':')[1]],
    },
    defaultValue: [],
  });

  return filter ? model.find(filter) : [];
};
