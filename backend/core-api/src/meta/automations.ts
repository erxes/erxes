import {
  replacePlaceHolders,
  setProperty,
  startAutomations,
} from 'erxes-api-shared/core-modules';
import { generateModels, IModels } from '../connectionResolvers';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { Express } from 'express';

const getRelatedValue = async (
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

const getItems = async (
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
      module: 'conformities',
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
    module: 'conformities',
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

export const initAutomation = (app: Express) =>
  startAutomations(app, 'core', {
    receiveActions: async ({ subdomain, data }) => {
      const { action, execution, actionType, targetType } = data;
      const models = await generateModels(subdomain);

      if (actionType === 'set-property') {
        const { module, rules } = action.config;

        const relatedItems = await getItems(
          subdomain,
          module,
          execution,
          targetType,
        );

        const result = await setProperty({
          models,
          subdomain,
          getRelatedValue,
          module: module.includes('lead') ? 'core:customer' : module,
          rules,
          execution,
          relatedItems,
          targetType,
        });
        return { result };
      }
      return { result: 'invalid core action type' };
    },
    replacePlaceHolders: async ({ subdomain, data }) => {
      const { target, config, relatedValueProps } = data || {};
      const models = await generateModels(subdomain);

      return await replacePlaceHolders<IModels>({
        models,
        subdomain,
        target,
        actionData: config,
        customResolver: {
          resolver: getRelatedValue,
          props: relatedValueProps,
        },
      });
    },
    getRecipientsEmails: async ({ subdomain, data }) => {
      const models = await generateModels(subdomain);
      const { type, config } = data;

      const ids = config[`${type}Ids`];

      const commonFilter = {
        _id: { $in: Array.isArray(ids) ? ids : [ids] },
      };

      if (type === 'user') {
        const result = await models.Users.find(commonFilter).distinct('email');

        return result;
      }

      const CONTACT_TYPES = {
        lead: {
          model: models.Customers,
          filter: { ...commonFilter },
        },
        customer: {
          model: models.Customers,
          filter: {
            ...commonFilter,
          },
        },
        company: {
          model: models.Companies,
          filter: { ...commonFilter },
        },
      };

      const { model, filter } = CONTACT_TYPES[type];

      return await model.find(filter).distinct('primaryEmail');
    },
  });
