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
  triggerType: string,
) => {
  const { target } = execution;

  if (module === triggerType) {
    return [target];
  }

  const models = await generateModels(subdomain);

  let model: any = models.Customers;

  if (module.includes('company')) {
    model = models.Companies;
  }

  const [moduleService] = module.split(':');
  const [triggerService, triggerContentType] = triggerType.split(':');

  if (
    triggerContentType !== 'form_submission' &&
    moduleService === triggerService
  ) {
    const relTypeIds = await sendTRPCMessage({
      pluginName: 'core',
      method: 'query',
      module: 'conformities',
      action: 'savedConformity',
      input: {
        mainType: triggerType.split(':')[1],
        mainTypeId: target._id,
        relTypes: [module.split(':')[1]],
      },
      defaultValue: [],
    });

    return model.find({ _id: { $in: relTypeIds } });
  }

  let filter;

  if (triggerContentType === 'form_submission') {
    filter = { _id: target._id };
  } else {
    filter = await sendTRPCMessage({
      pluginName: triggerService,
      method: 'query',
      module: 'conformities',
      action: 'getModuleRelation',
      input: {
        mainType: triggerType.split(':')[1],
        mainTypeId: target._id,
        relTypes: [module.split(':')[1]],
      },
      defaultValue: [],
    });
  }

  return filter ? model.find(filter) : [];
};

export const initAutomation = (app: Express) =>
  startAutomations(app, 'core', {
    receiveActions: async (
      { subdomain },
      { action, execution, triggerType, actionType },
    ) => {
      const models = await generateModels(subdomain);

      if (actionType === 'set-property') {
        const { module, rules } = action.config;

        const relatedItems = await getItems(
          subdomain,
          module,
          execution,
          triggerType,
        );

        const result = await setProperty({
          models,
          subdomain,
          getRelatedValue,
          module: module.includes('lead') ? 'core:customer' : module,
          rules,
          execution,
          relatedItems,
          triggerType,
        });
        return { result };
      }
      return { result: 'Hello World Core' };
    },
    replacePlaceHolders: async ({ subdomain }, { data }) => {
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
    getRecipientsEmails: async ({ subdomain }, { data }) => {
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
    constants: {
      triggers: [
        {
          type: 'core:user',
          icon: 'Users',
          label: 'Team member',
          description:
            'Start with a blank workflow that enrolls and is triggered off team members',
        },
        {
          type: 'core:customer',
          icon: 'UsersGroup',
          label: 'Customer',
          description:
            'Start with a blank workflow that enrolls and is triggered off Customers',
        },
        {
          type: 'core:lead',
          icon: 'UsersGroup',
          label: 'Lead',
          description:
            'Start with a blank workflow that enrolls and is triggered off Leads',
        },
        {
          type: 'core:company',
          icon: 'Building',
          label: 'Company',
          description:
            'Start with a blank workflow that enrolls and is triggered off company',
        },
        {
          type: 'core:form_submission',
          icon: 'Forms',
          label: 'Form submission',
          description:
            'Start with a blank workflow that enrolls and is triggered off form submission',
        },
      ],
    },
  });
