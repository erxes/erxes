import {
  InterMessage,
  connectToMessageBroker,
  sendRPCMessage,
} from '@erxes/api-utils/src/messageBroker';
import { sendMessage } from '@erxes/api-utils/src/core';
import type {
  MessageArgs,
  MessageArgsOmitService,
} from '@erxes/api-utils/src/core';
import { Activities } from './data/resolvers/queries/activityLogs';
import { formConsumers } from '@erxes/api-utils/src/consumers/forms';

import { logConsumers } from '@erxes/api-utils/src/consumers/logs';
import { internalNoteConsumers } from '@erxes/api-utils/src/consumers/internalNotes';
import { importExportCunsomers } from '@erxes/api-utils/src/consumers/importExport';
import { segmentsCunsomers } from '@erxes/api-utils/src/consumers/segments';
import { searchCunsomers } from '@erxes/api-utils/src/consumers/search';
import { tagConsumers } from '@erxes/api-utils/src/consumers/tags';
import { reportsCunsomers } from '@erxes/api-utils/src/consumers/reports';

import { templatesCunsomers } from '@erxes/api-utils/src/consumers/templates';
import { automationsCunsomers } from '@erxes/api-utils/src/consumers/automations';
import { registerOnboardHistory } from './data/modules/robot';
import templates from './templates';

import {
  escapeRegExp,
  getConfig,
  getConfigs,
  getFileUploadConfigs,
  sendEmail,
  sendMobileNotification,
} from './data/utils';

import { isEnabled } from '@erxes/api-utils/src/serviceDiscovery';

import logUtils from './logUtils';
import internalNotes from './internalNotes';
import forms from './forms';
import automations from './automations';
import { generateModels } from './connectionResolver';
import { USER_ROLES } from '@erxes/api-utils/src/constants';
import imports from './imports';
import exporter from './exporter';
import segments from './segments';
import {
  consumeQueue,
  consumeRPCQueue,
  consumeRPCQueueMq,
} from '@erxes/api-utils/src/messageBroker';

import { IActivityLogDocument } from './db/models/definitions/activityLogs';
import { receivePutLogCommand } from './db/utils/logUtils';
import {
  fetchSegment,
  isInSegment,
} from './data/modules/segments/queryBuilder';
import { fieldsCombinedByContentType } from './formUtils';
import { setupContactsMessageBroker } from './messageBrokers/contacts';
import search from './search';
import { setupProductMessageBroker } from './messageBrokers/products';
import tags from './tags';
import { setupInternalNotesMessageBroker } from './messageBrokers/internalNotes';
import { setupMessageEmailTemplatesConsumers } from './messageBrokers/emailTemplates';
import reports from './reports/reports';

export const initBroker = async (): Promise<void> => {
  await connectToMessageBroker(setupMessageConsumers);
};

export const setupMessageConsumers = async (): Promise<void> => {
  await setupContactsMessageBroker();
  await setupProductMessageBroker();
  await setupInternalNotesMessageBroker();
  await setupMessageEmailTemplatesConsumers();

  consumeQueue(
    'core:manage-installation-notification',
    async ({
      subdomain,
      type,
      name,
      message,
    }: InterMessage & { [others: string]: any }) => {
      const models = await generateModels(subdomain);

      if (type === 'uninstall' && message === 'done') {
        await models.InstallationLogs.deleteMany({ pluginName: name });
        return;
      }

      await models.InstallationLogs.createLog({
        pluginName: name,
        message,
      });

      if (message === 'done') {
        await models.InstallationLogs.deleteMany({
          pluginName: name,
          message: { $ne: 'done' },
        });
      }
    }
  );

  consumeQueue('core:runCrons', async () => {
    console.debug('Running crons ........');
  });

  consumeRPCQueue('core:permissions.find', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      status: 'success',
      data: await models.Permissions.find(data).lean(),
    };
  });

  consumeQueue('core:sendMobileNotification', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    await sendMobileNotification(models, data);
  });

  consumeQueue('core:sendEmail', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    await sendEmail(subdomain, data, models);
  });

  consumeRPCQueue(
    'core:conformities.addConformity',
    async ({ subdomain, data }) => {
      const models = await generateModels(subdomain);

      return {
        status: 'success',
        data: await models.Conformities.addConformity(data),
      };
    }
  );

  consumeRPCQueue(
    'core:conformities.savedConformity',
    async ({ subdomain, data }) => {
      const models = await generateModels(subdomain);

      return {
        status: 'success',
        data: await models.Conformities.savedConformity(data),
      };
    }
  );

  consumeQueue('core:conformities.create', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      status: 'success',
      data: await models.Conformities.create(data),
    };
  });

  consumeQueue('core:conformities.removeConformities', async ({ data }) => {
    const models = await generateModels(data);

    return {
      status: 'success',
      data: await models.Conformities.removeConformities(data),
    };
  });

  consumeQueue(
    'core:conformities.removeConformity',
    async ({ subdomain, data }) => {
      const models = await generateModels(subdomain);

      return {
        status: 'success',
        data: await models.Conformities.removeConformity(data),
      };
    }
  );

  consumeQueue(
    'core:conformities.deleteConformities',
    async ({ subdomain, data }) => {
      const models = await generateModels(subdomain);

      return {
        status: 'success',
        data: await models.Conformities.deleteConformities(data),
      };
    }
  );

  consumeRPCQueue(
    'core:conformities.getConformities',
    async ({ subdomain, data }) => {
      const models = await generateModels(subdomain);

      return {
        status: 'success',
        data: await models.Conformities.getConformities(data),
      };
    }
  );

  consumeQueue(
    'core:conformities.addConformities',
    async ({ subdomain, data }) => {
      const models = await generateModels(subdomain);

      return {
        status: 'success',
        data: await models.Conformities.addConformities(data),
      };
    }
  );

  consumeRPCQueue(
    'core:conformities.relatedConformity',
    async ({ subdomain, data }) => {
      const models = await generateModels(subdomain);

      return {
        status: 'success',
        data: await models.Conformities.relatedConformity(data),
      };
    }
  );

  consumeRPCQueue(
    'core:conformities.filterConformity',
    async ({ subdomain, data }) => {
      const models = await generateModels(subdomain);

      return {
        status: 'success',
        data: await models.Conformities.filterConformity(data),
      };
    }
  );

  consumeRPCQueue(
    'core:conformities.changeConformity',
    async ({ subdomain, data }) => {
      const models = await generateModels(subdomain);

      return {
        status: 'success',
        data: await models.Conformities.changeConformity(data),
      };
    }
  );

  consumeRPCQueue(
    'core:conformities.findConformities',
    async ({ subdomain, data }) => {
      const models = await generateModels(subdomain);

      return {
        status: 'success',
        data: await models.Conformities.find(data).lean(),
      };
    }
  );

  consumeRPCQueue(
    'core:conformities.editConformity',
    async ({ subdomain, data }) => {
      const models = await generateModels(subdomain);

      return {
        status: 'success',
        data: await models.Conformities.editConformity(data),
      };
    }
  );

  // listen for rpc queue =========
  consumeQueue(
    'core:registerOnboardHistory',
    async ({ subdomain, data: { type, user } }) => {
      const models = await generateModels(subdomain);

      await registerOnboardHistory(models, type, user);
    }
  );

  consumeRPCQueue('core:getConfigs', async ({ subdomain }) => {
    const models = await generateModels(subdomain);

    return {
      status: 'success',
      data: await getConfigs(models),
    };
  });

  consumeRPCQueue('core:configs.getValues', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      status: 'success',
      data: await models.Configs.find(data).distinct('value'),
    };
  });

  consumeRPCQueue(
    'core:configs.createOrUpdateConfig',
    async ({ subdomain, data }) => {
      const models = await generateModels(subdomain);

      return {
        status: 'success',
        data: await models.Configs.createOrUpdateConfig(data),
      };
    }
  );

  consumeRPCQueue(
    'core:configs.findOne',
    async ({ subdomain, data: { query } }) => {
      const models = await generateModels(subdomain);

      return {
        status: 'success',
        data: await models.Configs.findOne(query).lean(),
      };
    }
  );

  consumeRPCQueue(
    'core:getConfig',
    async ({ subdomain, data: { code, defaultValue } }) => {
      const models = await generateModels(subdomain);

      return {
        status: 'success',
        data: await getConfig(code, defaultValue, models),
      };
    }
  );

  consumeRPCQueue('core:users.findOne', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      status: 'success',
      data: await models.Users.findOne(data).lean(),
    };
  });

  consumeRPCQueue('core:users.getIds', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      status: 'success',
      data: await models.Users.findUsers(data, { _id: 1 }),
    };
  });

  consumeRPCQueue(
    'core:users.getIdsBySearchParams',
    async ({ subdomain, data }) => {
      const models = await generateModels(subdomain);

      const { searchValue } = data;

      const query: any = {};

      query.$or = [
        { email: new RegExp(`.*${searchValue}.*`, 'i') },
        { registrationNumber: new RegExp(`.*${searchValue}.*`, 'i') },
        { employeeId: new RegExp(`.*${searchValue}.*`, 'i') },
        { username: new RegExp(`.*${searchValue}.*`, 'i') },
        { 'details.fullName': new RegExp(`.*${searchValue}.*`, 'i') },
        { 'details.position': new RegExp(`.*${searchValue}.*`, 'i') },
      ];

      return {
        status: 'success',
        data: await models.Users.find(query).distinct('_id'),
      };
    }
  );

  consumeRPCQueue('core:users.checkLoginAuth', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      status: 'success',
      data: await models.Users.checkLoginAuth(data),
    };
  });

  consumeRPCQueue('core:departments.find', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      status: 'success',
      data: await models.Departments.find(data).lean(),
    };
  });

  consumeRPCQueue('core:departments.findOne', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      status: 'success',
      data: await models.Departments.findOne(data).lean(),
    };
  });

  consumeRPCQueue(
    'core:departments.findWithChild',
    async ({ subdomain, data: { query, fields } }) => {
      const models = await generateModels(subdomain);

      const departments = await models.Departments.find(query);

      if (!departments.length) {
        return {
          data: [],
          status: 'success',
        };
      }

      const orderQry: any[] = [];
      for (const tag of departments) {
        orderQry.push({
          order: { $regex: new RegExp(`^${escapeRegExp(tag.order || '')}`) },
        });
      }

      return {
        data: await models.Departments.find(
          {
            $or: orderQry,
          },
          fields || {}
        )
          .sort({ order: 1 })
          .lean(),
        status: 'success',
      };
    }
  );

  consumeRPCQueue(
    'core:users.updateOne',
    async ({ subdomain, data: { selector, modifier } }) => {
      const models = await generateModels(subdomain);

      return {
        status: 'success',
        data: await models.Users.updateOne(selector, modifier),
      };
    }
  );

  consumeRPCQueue(
    'core:users.updateMany',
    async ({ subdomain, data: { selector, modifier } }) => {
      const models = await generateModels(subdomain);

      return {
        status: 'success',
        data: await models.Users.updateMany(selector, modifier),
      };
    }
  );

  consumeRPCQueue(
    'core:users.getCount',
    async ({ subdomain, data: { query } }) => {
      const models = await generateModels(subdomain);

      return {
        status: 'success',
        data: await models.Users.countDocuments(query),
      };
    }
  );

  consumeRPCQueue('core:users.create', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      status: 'success',
      data: await models.Users.createUser(data),
    };
  });

  consumeRPCQueue(
    'core:users.setActiveStatus',
    async ({ subdomain, data: { _id } }) => {
      const models = await generateModels(subdomain);

      return {
        status: 'success',
        data: await models.Users.setUserActiveOrInactive(_id),
      };
    }
  );

  consumeRPCQueue('core:users.find', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    const { query, sort = {}, fields, skip, limit } = data;
    return {
      status: 'success',
      data: await models.Users.find(
        {
          ...query,
          role: { $ne: USER_ROLES.SYSTEM },
        },
        fields
      )
        .sort(sort)
        .skip(skip || 0)
        .limit(limit || 0)
        .lean(),
    };
  });

  consumeRPCQueue('core:users.comparePassword', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    const { password, userPassword } = data;

    return {
      status: 'success',
      data: await models.Users.comparePassword(password, userPassword),
    };
  });

  consumeRPCQueue(
    'core:brands.findOne',
    async ({ subdomain, data: { query } }) => {
      const models = await generateModels(subdomain);

      return {
        status: 'success',
        data: await models.Brands.getBrand(query),
      };
    }
  );

  consumeRPCQueue('core:brands.find', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    const { query } = data;

    return {
      status: 'success',
      data: await models.Brands.find(query).lean(),
    };
  });

  consumeRPCQueue('core:brands.create', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      status: 'success',
      data: await models.Brands.createBrand(data),
    };
  });
  consumeRPCQueue('core:brands.updateOne', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      status: 'success',
      data: await models.Brands.updateBrand(data._id, data.fields),
    };
  });

  consumeRPCQueue('core:positions.find', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    const { query } = data;

    return {
      status: 'success',
      data: await models.Positions.find(query).lean(),
    };
  });

  consumeRPCQueue('core:branches.aggregate', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    const { pipeline } = data;

    return {
      status: 'success',
      data: await models.Branches.aggregate(pipeline).exec(),
    };
  });

  consumeRPCQueue('core:branches.find', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    const { query, fields } = data;

    return {
      status: 'success',
      data: await models.Branches.find(query, fields).lean(),
    };
  });

  consumeRPCQueue('core:branches.findOne', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      status: 'success',
      data: await models.Branches.findOne(data).lean(),
    };
  });

  consumeRPCQueue(
    'core:branches.findWithChild',
    async ({ subdomain, data: { query, fields } }) => {
      const models = await generateModels(subdomain);

      const branches = await models.Branches.find(query);

      if (!branches.length) {
        return {
          data: [],
          status: 'success',
        };
      }

      const orderQry: any[] = [];
      for (const tag of branches) {
        orderQry.push({
          order: { $regex: new RegExp(`^${escapeRegExp(tag.order || '')}`) },
        });
      }

      return {
        data: await models.Branches.find(
          {
            $or: orderQry,
          },
          fields || {}
        )
          .sort({ order: 1 })
          .lean(),
        status: 'success',
      };
    }
  );

  consumeRPCQueue('core:units.find', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      status: 'success',
      data: await models.Units.find(data).lean(),
    };
  });

  consumeRPCQueue('core:units.findOne', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      status: 'success',
      data: await models.Units.findOne(data).lean(),
    };
  });

  consumeRPCQueue('core:userGroups.getIds', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      status: 'success',
      data: await models.UsersGroups.find(data).distinct('_id'),
    };
  });

  consumeRPCQueue('core:getFileUploadConfigs', async ({ subdomain }) => {
    const models = await generateModels(subdomain);

    return {
      status: 'success',
      data: await getFileUploadConfigs(models),
    };
  });

  logConsumers({
    name: 'core',
    logs: logUtils,
  });

  internalNoteConsumers({
    name: 'core',
    internalNotes,
  });

  formConsumers({
    name: 'core',
    forms,
  });

  automationsCunsomers({ name: 'core', automations });

  tagConsumers({ name: 'core', tags });
  reportsCunsomers({ name: 'core', reports });
  importExportCunsomers({ name: 'core', imports, exporter });
  segmentsCunsomers({ name: 'core', segments });
  searchCunsomers({ name: 'core', search });
  templatesCunsomers({ name: 'core', templates });

  consumeRPCQueueMq('core:isServiceEnabled', async ({ data }) => ({
    status: 'success',
    data: await isEnabled(data),
  }));

  //tags
  consumeRPCQueue('core:tagFind', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      data: await models.Tags.find(data).lean(),
      status: 'success',
    };
  });

  consumeRPCQueue('core:tagFindOne', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      data: await models.Tags.findOne(data).lean(),
      status: 'success',
    };
  });

  consumeRPCQueue('core:createTag', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      status: 'success',
      data: await models.Tags.createTag(data),
    };
  });

  consumeRPCQueue(
    'core:tagWithChilds',
    async ({ subdomain, data: { query, fields } }) => {
      const models = await generateModels(subdomain);

      const tags = await models.Tags.find(query);

      if (!tags.length) {
        return {
          data: [],
          status: 'success',
        };
      }

      const orderQry: any[] = [];
      for (const tag of tags) {
        orderQry.push({
          order: { $regex: new RegExp(`^${escapeRegExp(tag.order || '')}`) },
        });
      }

      return {
        data: await models.Tags.find(
          {
            $or: orderQry,
          },
          fields || {}
        )
          .sort({ order: 1 })
          .lean(),
        status: 'success',
      };
    }
  );

  consumeQueue('putLog', async ({ data, subdomain }) => {
    const models = await generateModels(subdomain);

    try {
      await receivePutLogCommand(models, data);
    } catch (e) {
      throw new Error(`Error occurred when receiving putLog message: ${e}`);
    }
  });

  consumeQueue('core:visitor.createOrUpdate', async ({ data, subdomain }) => {
    const models = await generateModels(subdomain);

    await models.Visitors.createOrUpdateVisitorLog(data);
  });

  consumeQueue(
    'core:visitor.convertRequest',
    async ({ data: { visitorId }, subdomain }) => {
      const models = await generateModels(subdomain);
      const visitor = await models.Visitors.getVisitorLog(visitorId);

      await sendInboxMessage({
        subdomain,
        action: 'visitor.convertResponse',
        data: visitor,
      });
    }
  );

  consumeQueue(
    'core:visitor.updateEntry',
    async ({ data: { visitorId, location: browserInfo }, subdomain }) => {
      const models = await generateModels(subdomain);

      await models.Visitors.updateVisitorLog({
        visitorId,
        location: browserInfo,
      });
    }
  );

  consumeQueue(
    'core:visitor.removeEntry',
    async ({ data: { visitorId }, subdomain }) => {
      const models = await generateModels(subdomain);

      await models.Visitors.removeVisitorLog(visitorId);
    }
  );

  consumeQueue('putActivityLog', async (args) => {
    const { data: obj, subdomain } = args;

    const models = await generateModels(subdomain);

    const { data, action } = obj;

    switch (action) {
      case 'removeActivityLogs': {
        const { type, itemIds } = data;

        return models.ActivityLogs.removeActivityLogs(type, itemIds);
      }
      case 'removeActivityLog': {
        const { contentTypeId } = data;

        return models.ActivityLogs.removeActivityLog(contentTypeId);
      }
      default:
        if (action) {
          return models.ActivityLogs.addActivityLog(data);
        }

        break;
    }
  });

  consumeQueue(
    'core:activityLogs.updateMany',
    async ({ data: { query, modifier }, subdomain }) => {
      const models = await generateModels(subdomain);

      if (query && modifier) {
        await models.ActivityLogs.updateMany(query, modifier);
      }
    }
  );

  consumeRPCQueue("core:activityLogs.findOne", async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);
    const query = await Activities(subdomain, models, data)
    return {
      status: "success",
      data: query
    };
  });


  consumeQueue(
    'core:delete.old',
    async ({ data: { months = 1 }, subdomain }) => {
      const models = await generateModels(subdomain);
      const now = new Date();

      await models.Logs.deleteMany({
        createdAt: {
          $lte: new Date(
            now.getFullYear(),
            now.getMonth() - months,
            now.getDate()
          ),
        },
      });
    }
  );

  consumeRPCQueue(
    'core:activityLogs.findMany',
    async ({ data: { query, options }, subdomain }) => {
      const models = await generateModels(subdomain);

      return {
        data: await models.ActivityLogs.find(query, options).lean(),
        status: 'success',
      };
    }
  );

  consumeRPCQueue(
    'core:emailDeliveries.create',
    async ({ subdomain, data }) => {
      const models = await generateModels(subdomain);

      return {
        status: 'success',
        data: await models.EmailDeliveries.createEmailDelivery(data),
      };
    }
  );

  consumeRPCQueue(
    'core:emailDeliveries.find',
    async ({ subdomain, data: { query } }) => {
      const models = await generateModels(subdomain);

      return {
        status: 'success',
        data: await models.EmailDeliveries.find(query).lean(),
      };
    }
  );

  //segments

  consumeRPCQueue('core:segmentFindOne', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      data: await models.Segments.findOne(data).lean(),
      status: 'success',
    };
  });

  consumeRPCQueue('core:segmentFind', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return { data: await models.Segments.find(data).lean(), status: 'success' };
  });

  consumeRPCQueue(
    'core:segmentCount',
    async ({ subdomain, data: { selector } }) => {
      const models = await generateModels(subdomain);

      return {
        data: await models.Segments.find(selector).countDocuments(),
        status: 'success',
      };
    }
  );

  consumeRPCQueue(
    'core:fetchSegment',
    async ({ subdomain, data: { segmentId, options, segmentData } }) => {
      const models = await generateModels(subdomain);

      const segment = segmentData
        ? segmentData
        : await models.Segments.findOne({ _id: segmentId }).lean();

      return {
        data: await fetchSegment(models, subdomain, segment, options),
        status: 'success',
      };
    }
  );

  consumeRPCQueue(
    'core:isInSegment',
    async ({ subdomain, data: { segmentId, idToCheck, options } }) => {
      const models = await generateModels(subdomain);

      const data = await isInSegment(
        models,
        subdomain,
        segmentId,
        idToCheck,
        options
      );

      return { data, status: 'success' };
    }
  );

  consumeQueue(
    'core:removeSegment',
    async ({ subdomain, data: { segmentId } }) => {
      const models = await generateModels(subdomain);

      return {
        status: 'success',
        data: await models.Segments.removeSegment(segmentId),
      };
    }
  );

  consumeRPCQueue(
    'core:findSubSegments',
    async ({ subdomain, data: { segmentIds } }) => {
      const models = await generateModels(subdomain);

      const segments = await models.Segments.find({ _id: { $in: segmentIds } });

      if (!segments?.length) {
        return {
          status: 'error',
          errorMessage: 'Segments not found',
        };
      }

      let subSegmentIds: string[] = [];

      for (const { conditions } of segments || []) {
        for (const { subSegmentId } of conditions || []) {
          if (subSegmentId) {
            subSegmentIds.push(subSegmentId);
          }
        }
      }

      return {
        status: 'success',
        data: await models.Segments.find({
          _id: {
            $in: subSegmentIds,
          },
        }),
      };
    }
  );

  //forms

  consumeRPCQueue(
    'core:validate',
    async ({ subdomain, data: { formId, submissions } }) => {
      const models = await generateModels(subdomain);

      return {
        status: 'success',
        data: await models.Forms.validateForm(formId, submissions),
      };
    }
  );

  consumeRPCQueue('core:formsFind', async ({ subdomain, data: { query } }) => {
    const models = await generateModels(subdomain);

    return {
      status: 'success',
      data: await models.Forms.find(query).lean(),
    };
  });

  consumeRPCQueue('core:formsFindOne', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      status: 'success',
      data: await models.Forms.findOne(data).lean(),
    };
  });

  consumeRPCQueue(
    'core:duplicate',
    async ({ subdomain, data: { formId, userId } }) => {
      const models = await generateModels(subdomain);

      return {
        status: 'success',
        data: await models.Forms.duplicate(formId, userId),
      };
    }
  );

  consumeRPCQueue(
    'core:createForm',
    async ({ subdomain, data: { formDoc, userId } }) => {
      const models = await generateModels(subdomain);

      return {
        status: 'success',
        data: await models.Forms.createForm(formDoc, userId),
      };
    }
  );

  consumeRPCQueue(
    'core:removeForm',
    async ({ subdomain, data: { formId } }) => {
      const models = await generateModels(subdomain);

      return {
        status: 'success',
        data: await models.Forms.removeForm(formId),
      };
    }
  );

  consumeQueue(
    'core:fields.insertMany',
    async ({ subdomain, data: { fields } }) => {
      const models = await generateModels(subdomain);

      return models.Fields.insertMany(fields);
    }
  );

  consumeRPCQueue(
    'core:fields.prepareCustomFieldsData',
    async ({ subdomain, data }) => {
      const models = await generateModels(subdomain);
      return {
        status: 'success',
        data: await models.Fields.prepareCustomFieldsData(data),
      };
    }
  );

  consumeRPCQueue(
    'core:fields.generateCustomFieldsData',
    async ({ subdomain, data: { customData, contentType } }) => {
      const models = await generateModels(subdomain);

      return {
        status: 'success',
        data: await models.Fields.generateCustomFieldsData(
          customData,
          contentType
        ),
      };
    }
  );

  consumeRPCQueue('core:fields.create', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      status: 'success',
      data: await models.Fields.createField(data),
    };
  });

  consumeRPCQueue(
    'core:fields.updateOne',
    async ({ subdomain, data: { selector, modifier } }) => {
      const models = await generateModels(subdomain);

      return {
        status: 'success',
        data: await models.Fields.updateOne(selector, modifier),
      };
    }
  );

  consumeRPCQueue(
    'core:fields.generateTypedListFromMap',
    async ({ subdomain, data }) => {
      const models = await generateModels(subdomain);

      return {
        status: 'success',
        data: await models.Fields.generateTypedListFromMap(data),
      };
    }
  );

  consumeRPCQueue(
    'core:fields.generateTypedItem',
    async ({ subdomain, data }) => {
      const models = await generateModels(subdomain);

      return {
        status: 'success',
        data: await models.Fields.generateTypedItem(
          data.field,
          data.value,
          data.type,
          data.validation
        ),
      };
    }
  );

  consumeRPCQueue(
    'core:fields.fieldsCombinedByContentType',
    async ({ subdomain, data }) => {
      const models = await generateModels(subdomain);

      return {
        status: 'success',
        data: await fieldsCombinedByContentType(models, subdomain, data),
      };
    }
  );

  consumeQueue(
    'core:updateGroup',
    async ({ subdomain, data: { groupId, fieldsGroup } }) => {
      const models = await generateModels(subdomain);

      return {
        status: 'success',
        data: await models.FieldsGroups.updateGroup(groupId, fieldsGroup),
      };
    }
  );

  consumeRPCQueue(
    'core:fields.find',
    async ({ subdomain, data: { query, projection, sort } }) => {
      const models = await generateModels(subdomain);

      return {
        status: 'success',
        data: await models.Fields.find(query, projection).sort(sort).lean(),
      };
    }
  );

  consumeRPCQueue(
    'core:fields.findOne',
    async ({ subdomain, data: { query } }) => {
      const models = await generateModels(subdomain);

      return {
        status: 'success',
        data: await models.Fields.findOne(query).lean(),
      };
    }
  );

  consumeRPCQueue(
    'core:fieldsGroups.find',
    async ({ subdomain, data: { query } }) => {
      const models = await generateModels(subdomain);

      return {
        status: 'success',
        data: await models.FieldsGroups.find(query).lean(),
      };
    }
  );

  consumeRPCQueue(
    'core:fieldsGroups.findOne',
    async ({ subdomain, data: { query } }) => {
      const models = await generateModels(subdomain);

      return {
        status: 'success',
        data: await models.FieldsGroups.findOne(query).lean(),
      };
    }
  );

  consumeRPCQueue(
    'core:fieldsCombinedByContentType',
    async ({ subdomain, data }) => {
      const models = await generateModels(subdomain);

      return {
        status: 'success',
        data: await fieldsCombinedByContentType(models, subdomain, data),
      };
    }
  );

  consumeRPCQueue(
    'core:submissions.find',
    async ({ subdomain, data: { query } }) => {
      const models = await generateModels(subdomain);

      return {
        status: 'success',
        data: await models.FormSubmissions.find(query).lean(),
      };
    }
  );

  consumeQueue(
    'core:submissions.createFormSubmission',
    async ({ subdomain, data: { submissions } }) => {
      const models = await generateModels(subdomain);

      return {
        status: 'success',
        data: await models.FormSubmissions.insertMany(submissions, {
          ordered: false,
        }),
      };
    }
  );

  // exchange rates
  consumeRPCQueue('core:exchangeRates.create', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      data: await models.ExchangeRates.createExchangeRate(data),
      status: 'success',
    };
  });

  consumeRPCQueue(
    'core:exchangeRates.update',
    async ({ subdomain, data: { selector, modifier } }) => {
      const models = await generateModels(subdomain);

      return {
        data: await models.ExchangeRates.updateOne(selector, modifier),
        status: 'success',
      };
    }
  );

  consumeRPCQueue('core:exchangeRates.findOne', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      data: await models.ExchangeRates.findOne(data).lean(),
      status: 'success',
    };
  });

  consumeRPCQueue(
    'core:exchangeRates.getActiveRate',
    async ({ subdomain, data: { date, rateCurrency, mainCurrency } }) => {
      const models = await generateModels(subdomain);

      return {
        data: await models.ExchangeRates.getActiveRate({
          date,
          rateCurrency,
          mainCurrency,
        }),
        status: 'success',
      };
    }
  );
};

export const sendCommonMessage = async (args: MessageArgs): Promise<any> => {
  return sendMessage({
    ...args,
  });
};

export const sendIntegrationsMessage = (
  args: MessageArgsOmitService
): Promise<any> => {
  return sendMessage({
    serviceName: 'integrations',
    ...args,
  });
};

export const sendInboxMessage = (
  args: MessageArgsOmitService
): Promise<any> => {
  return sendMessage({
    serviceName: 'inbox',
    ...args,
  });
};

export const sendNotificationsMessage = async (
  args: MessageArgsOmitService
): Promise<any> => {
  return sendMessage({
    serviceName: 'notifications',
    ...args,
  });
};

const checkService = async (serviceName: string, needsList?: boolean) => {
  const enabled = await isEnabled(serviceName);

  if (!enabled) {
    return needsList ? [] : null;
  }

  return;
};

export const getContentIds = async (subdomain: string, data) => {
  const [serviceName] = data.contentType.split(':');

  await checkService(serviceName, true);

  return sendCommonMessage({
    subdomain,
    serviceName,
    action: 'logs.getContentIds',
    data,
    isRPC: true,
  });
};

export const fetchServiceSegments = async (
  subdomain: string,
  contentType: string,
  action: string,
  data,
  defaultValue?
) => {
  const [serviceName, type] = contentType.split(':');

  return sendMessage({
    subdomain,
    isRPC: true,
    serviceName,
    action: `logs.${action}`,
    data: {
      ...data,
      type,
    },
    defaultValue,
  });
};

export const fetchServiceForms = async (
  subdomain: string,
  contentType: string,
  action: string,
  data,
  defaultValue?
) => {
  const [serviceName, type] = contentType.split(':');

  return sendMessage({
    subdomain,
    isRPC: true,
    serviceName,
    action: `fields.${action}`,
    data: {
      ...data,
      type,
    },
    defaultValue,
  });
};

export const getDbSchemaLabels = async (serviceName: string, args) => {
  const enabled = await isEnabled(serviceName);

  return enabled
    ? sendRPCMessage(`${serviceName}:logs.getSchemaLabels`, args)
    : [];
};

export const getContentTypeDetail = async (
  subdomain: string,
  activityLog: IActivityLogDocument
) => {
  const [serviceName] = activityLog.contentType.split(':');

  const enabled = await isEnabled(serviceName);

  return enabled
    ? sendRPCMessage(`${serviceName}:logs.getContentTypeDetail`, {
      subdomain,
      data: activityLog,
    })
    : null;
};

export const sendClientPortalMessage = (args: MessageArgsOmitService) => {
  return sendMessage({
    serviceName: 'clientportal',
    ...args,
  });
};

export const sendEngagesMessage = async (
  args: MessageArgsOmitService
): Promise<any> => {
  return sendMessage({
    serviceName: 'engages',
    ...args,
  });
};

export const sendSalesMessage = async (
  args: MessageArgsOmitService
): Promise<any> => {
  return sendMessage({
    serviceName: 'sales',
    ...args,
  });
};

export const sendTasksMessage = async (
  args: MessageArgsOmitService
): Promise<any> => {
  return sendMessage({
    serviceName: 'tasks',
    ...args,
  });
};

export const sendTicketsMessage = async (
  args: MessageArgsOmitService
): Promise<any> => {
  return sendMessage({
    serviceName: 'tickets',
    ...args,
  });
};

export const sendPurchasesMessage = async (
  args: MessageArgsOmitService
): Promise<any> => {
  return sendMessage({
    serviceName: 'purchases',
    ...args,
  });
};

export const sendLoyaltiesMessage = (args: MessageArgsOmitService) => {
  return sendMessage({
    serviceName: 'loyalties',
    ...args,
  });
};