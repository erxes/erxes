import { init as initBrokerCore } from '@erxes/api-utils/src/messageBroker';
import { ISendMessageArgs, sendMessage } from '@erxes/api-utils/src/core';

import { logConsumers } from '@erxes/api-utils/src/logUtils';
import { internalNoteConsumers } from '@erxes/api-utils/src/internalNotes';
import { formConsumers } from '@erxes/api-utils/src/forms';
import { graphqlPubsub } from './pubsub';
import { registerOnboardHistory } from './data/modules/robot';
import { registerModule } from './data/permissions/utils';
import {
  getConfig,
  getConfigs,
  getFileUploadConfigs,
  sendEmail,
  sendMobileNotification
} from './data/utils';

import * as serviceDiscovery from './serviceDiscovery';

import logUtils from './logUtils';
import internalNotes from './internalNotes';
import forms from './forms';
import { generateModels } from './connectionResolver';
import { USER_ROLES } from '@erxes/api-utils/src/constants';
import imports from './imports';
import exporter from './exporter';

let client;

export const initBroker = async options => {
  client = await initBrokerCore(options);

  // do not receive messages in crons worker
  const { consumeQueue, consumeRPCQueue } = client;

  consumeQueue(
    'core:manage-installation-notification',
    async ({ subdomain, type, name, message }) => {
      const models = await generateModels(subdomain);

      if (type === 'uninstall' && message === 'done') {
        await models.InstallationLogs.remove({ pluginName: name });
        return;
      }

      await models.InstallationLogs.createLog({
        pluginName: name,
        message
      });

      if (message === 'done') {
        await models.InstallationLogs.remove({
          pluginName: name,
          message: { $ne: 'done' }
        });
      }
    }
  );

  consumeQueue('core:runCrons', async () => {
    console.log('Running crons ........');
  });

  consumeQueue('registerPermissions', async permissions => {
    await registerModule(permissions);
  });

  consumeRPCQueue('core:permissions.find', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      status: 'success',
      data: await models.Permissions.find(data).lean()
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
        data: await models.Conformities.addConformity(data)
      };
    }
  );

  consumeRPCQueue(
    'core:conformities.savedConformity',
    async ({ subdomain, data }) => {
      const models = await generateModels(subdomain);

      return {
        status: 'success',
        data: await models.Conformities.savedConformity(data)
      };
    }
  );

  consumeQueue('core:conformities.create', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      status: 'success',
      data: await models.Conformities.create(data)
    };
  });

  consumeQueue('core:conformities.removeConformities', async ({ data }) => {
    const models = await generateModels(data);

    return {
      status: 'success',
      data: await models.Conformities.removeConformities(data)
    };
  });

  consumeQueue(
    'core:conformities.removeConformity',
    async ({ subdomain, data }) => {
      const models = await generateModels(subdomain);

      return {
        status: 'success',
        data: await models.Conformities.removeConformity(data)
      };
    }
  );

  consumeRPCQueue(
    'core:conformities.getConformities',
    async ({ subdomain, data }) => {
      const models = await generateModels(subdomain);

      return {
        status: 'success',
        data: await models.Conformities.getConformities(data)
      };
    }
  );

  consumeQueue(
    'core:conformities.addConformities',
    async ({ subdomain, data }) => {
      const models = await generateModels(subdomain);

      return {
        status: 'success',
        data: await models.Conformities.addConformities(data)
      };
    }
  );

  consumeRPCQueue(
    'core:conformities.relatedConformity',
    async ({ subdomain, data }) => {
      const models = await generateModels(subdomain);

      return {
        status: 'success',
        data: await models.Conformities.relatedConformity(data)
      };
    }
  );

  consumeRPCQueue(
    'core:conformities.filterConformity',
    async ({ subdomain, data }) => {
      const models = await generateModels(subdomain);

      return {
        status: 'success',
        data: await models.Conformities.filterConformity(data)
      };
    }
  );

  consumeRPCQueue(
    'core:conformities.changeConformity',
    async ({ subdomain, data }) => {
      const models = await generateModels(subdomain);

      return {
        status: 'success',
        data: await models.Conformities.changeConformity(data)
      };
    }
  );

  consumeRPCQueue(
    'core:conformities.findConformities',
    async ({ subdomain, data }) => {
      const models = await generateModels(subdomain);

      return {
        status: 'success',
        data: await models.Conformities.find(data).lean()
      };
    }
  );

  consumeRPCQueue(
    'core:conformities.editConformity',
    async ({ subdomain, data }) => {
      const models = await generateModels(subdomain);

      return {
        status: 'success',
        data: await models.Conformities.editConformity(data)
      };
    }
  );

  // graphql subscriptions call =========
  consumeQueue('callPublish', params => {
    graphqlPubsub.publish(params.name, params.data);
  });

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
      data: await getConfigs(models)
    };
  });

  consumeRPCQueue('core:configs.getValues', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      status: 'success',
      data: await models.Configs.find(data).distinct('value')
    };
  });

  consumeRPCQueue(
    'core:configs.findOne',
    async ({ subdomain, data: { query } }) => {
      const models = await generateModels(subdomain);

      return {
        status: 'success',
        data: await models.Configs.findOne(query).lean()
      };
    }
  );

  consumeRPCQueue(
    'core:getConfig',
    async ({ subdomain, data: { code, defaultValue } }) => {
      const models = await generateModels(subdomain);

      return {
        status: 'success',
        data: await getConfig(code, defaultValue, models)
      };
    }
  );

  consumeRPCQueue('core:users.findOne', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      status: 'success',
      data: await models.Users.findOne(data).lean()
    };
  });

  consumeRPCQueue('core:users.getIds', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      status: 'success',
      data: await models.Users.findUsers(data, { _id: 1 })
    };
  });

  consumeRPCQueue('core:departments.find', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      status: 'success',
      data: await models.Departments.find(data).lean()
    };
  });

  consumeRPCQueue('core:departments.findOne', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      status: 'success',
      data: await models.Departments.findOne(data).lean()
    };
  });

  consumeRPCQueue(
    'core:users.updateOne',
    async ({ subdomain, data: { selector, modifier } }) => {
      const models = await generateModels(subdomain);

      return {
        status: 'success',
        data: await models.Users.updateOne(selector, modifier)
      };
    }
  );

  consumeRPCQueue(
    'core:users.updateMany',
    async ({ subdomain, data: { selector, modifier } }) => {
      const models = await generateModels(subdomain);

      return {
        status: 'success',
        data: await models.Users.updateMany(selector, modifier)
      };
    }
  );

  consumeRPCQueue(
    'core:users.getCount',
    async ({ subdomain, data: { query } }) => {
      const models = await generateModels(subdomain);

      return {
        status: 'success',
        data: await models.Users.countDocuments(query)
      };
    }
  );

  consumeRPCQueue('core:users.create', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      status: 'success',
      data: await models.Users.createUser(data)
    };
  });

  consumeRPCQueue('core:users.find', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    const { query, sort = {} } = data;

    return {
      status: 'success',
      data: await models.Users.find({
        ...query,
        role: { $ne: USER_ROLES.SYSTEM }
      })
        .sort(sort)
        .lean()
    };
  });

  consumeRPCQueue('core:users.comparePassword', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    const { password, userPassword } = data;

    return {
      status: 'success',
      data: await models.Users.comparePassword(password, userPassword)
    };
  });

  consumeRPCQueue(
    'core:brands.findOne',
    async ({ subdomain, data: { query } }) => {
      const models = await generateModels(subdomain);

      return {
        status: 'success',
        data: await models.Brands.getBrand(query)
      };
    }
  );

  consumeRPCQueue('core:brands.find', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    const { query } = data;

    return {
      status: 'success',
      data: await models.Brands.find(query).lean()
    };
  });

  consumeRPCQueue('core:branches.find', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    const { query } = data;

    return {
      status: 'success',
      data: await models.Branches.find(query).lean()
    };
  });

  consumeRPCQueue('core:branches.findOne', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      status: 'success',
      data: await models.Branches.findOne(data).lean()
    };
  });

  consumeRPCQueue('core:units.find', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      status: 'success',
      data: await models.Units.find(data).lean()
    };
  });

  consumeRPCQueue('core:units.findOne', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      status: 'success',
      data: await models.Units.findOne(data).lean()
    };
  });

  consumeRPCQueue('core:getFileUploadConfigs', async ({ subdomain }) => {
    const models = await generateModels(subdomain);

    return {
      status: 'success',
      data: await getFileUploadConfigs(models)
    };
  });

  logConsumers({
    name: 'core',
    consumeRPCQueue,
    getActivityContent: logUtils.getActivityContent,
    collectItems: logUtils.collectItems,
    getSchemalabels: logUtils.getSchemaLabels
  });

  internalNoteConsumers({
    name: 'core',
    consumeRPCQueue,
    generateInternalNoteNotif: internalNotes.generateInternalNoteNotif
  });

  formConsumers({
    name: 'core',
    consumeRPCQueue,
    systemFields: forms.systemFields
  });

  consumeRPCQueue('core:fields.getList', async ({ subdomain, data }) => {
    return {
      status: 'success',
      data: await forms.fields({ subdomain, data })
    };
  });

  consumeRPCQueue('core:imports:prepareImportDocs', async args => {
    return {
      status: 'success',
      data: await imports.prepareImportDocs(args)
    };
  });

  consumeRPCQueue('core:imports:insertImportItems', async args => ({
    status: 'success',
    data: await imports.insertImportItems(args)
  }));

  consumeRPCQueue('core:exporter:prepareExportData', async args => ({
    status: 'success',
    data: await exporter.prepareExportData(args)
  }));

  consumeRPCQueue('core:exporter:getExportDocs', async args => ({
    status: 'success',
    data: await exporter.getExportDocs(args)
  }));

  return client;
};

interface IISendMessageArgs {
  subdomain: string;
  action: string;
  data;
  isRPC?: boolean;
  defaultValue?;
  serviceName: string;
}

export const sendCommonMessage = async (
  args: IISendMessageArgs
): Promise<any> => {
  return sendMessage({
    serviceDiscovery,
    client,
    ...args
  });
};

export const sendSegmentsMessage = async (
  args: ISendMessageArgs
): Promise<any> => {
  return sendMessage({
    client,
    serviceDiscovery,
    serviceName: 'segments',
    ...args
  });
};

export const sendIntegrationsMessage = (
  args: ISendMessageArgs
): Promise<any> => {
  return sendMessage({
    client,
    serviceDiscovery,
    serviceName: 'integrations',
    ...args
  });
};

export const sendCardsMessage = (args: ISendMessageArgs): Promise<any> => {
  return sendMessage({
    client,
    serviceDiscovery,
    serviceName: 'cards',
    ...args
  });
};

export const sendLogsMessage = (args: ISendMessageArgs): Promise<any> => {
  return sendMessage({
    client,
    serviceDiscovery,
    serviceName: 'logs',
    ...args
  });
};

export const sendContactsMessage = (args: ISendMessageArgs): Promise<any> => {
  return sendMessage({
    client,
    serviceDiscovery,
    serviceName: 'contacts',
    ...args
  });
};

export const sendInboxMessage = (args: ISendMessageArgs): Promise<any> => {
  return sendMessage({
    client,
    serviceDiscovery,
    serviceName: 'inbox',
    ...args
  });
};

export const sendFormsMessage = (args: ISendMessageArgs): Promise<any> => {
  return sendMessage({
    client,
    serviceDiscovery,
    serviceName: 'forms',
    ...args
  });
};

export const fetchSegment = (
  subdomain: string,
  segmentId: string,
  options?,
  segmentData?: any
) =>
  sendSegmentsMessage({
    subdomain,
    action: 'fetchSegment',
    data: { segmentId, options, segmentData },
    isRPC: true
  });

export default function() {
  return client;
}
