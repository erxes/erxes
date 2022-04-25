import { init as initBrokerCore } from "@erxes/api-utils/src/messageBroker";
import { ISendMessageArgs, sendMessage } from "@erxes/api-utils/src/core";

import { logConsumers } from "@erxes/api-utils/src/logUtils";
import { internalNoteConsumers } from "@erxes/api-utils/src/internalNotes";
import { formConsumers } from "@erxes/api-utils/src/forms";
import { graphqlPubsub } from "./pubsub";
import { registerOnboardHistory } from "./data/modules/robot";
import {
  Conformities,
  Branches,
  Departments,
} from "./db/models";
import { registerModule } from "./data/permissions/utils";
import {
  getConfig,
  getConfigs,
  getFileUploadConfigs,
  sendEmail,
  sendMobileNotification,
} from "./data/utils";

import * as serviceDiscovery from "./serviceDiscovery";

import logUtils from "./logUtils";
import internalNotes from "./internalNotes";
import forms from "./forms";
import { generateModels } from "./connectionResolver";

let client;

export const initBroker = async options => {
  client = await initBrokerCore(options);

  // do not receive messages in crons worker
  const { consumeQueue, consumeRPCQueue } = client;

  consumeQueue("core:runCrons", async () => {
    console.log("Running crons ........");
  });

  consumeQueue("registerPermissions", async permissions => {
    await registerModule(permissions);
  });

  consumeQueue("core:sendMobileNotification", async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    await sendMobileNotification(models, data);
  });

  consumeQueue("core:sendEmail", async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    await sendEmail(models, subdomain, data);
  });

  consumeRPCQueue("core:conformities.addConformity", async ({ data }) => ({
    status: "success",
    data: await Conformities.addConformity(data),
  }));

  consumeRPCQueue("core:conformities.savedConformity", async ({ data }) => ({
    status: "success",
    data: await Conformities.savedConformity(data),
  }));

  consumeQueue("core:conformities.create", async ({ data }) => ({
    status: "success",
    data: await Conformities.create(data),
  }));

  consumeQueue("core:conformities.removeConformities", async ({ data }) => ({
    status: "success",
    data: await Conformities.removeConformities(data),
  }));

  consumeQueue("core:conformities.removeConformity", async ({ data }) => ({
    status: "success",
    data: await Conformities.removeConformity(data),
  }));

  consumeRPCQueue("core:conformities.getConformities", async ({ data }) => ({
    status: "success",
    data: await Conformities.getConformities(data),
  }));

  consumeQueue("core:conformities.addConformities", async ({ data }) => ({
    status: "success",
    data: await Conformities.addConformities(data),
  }));

  consumeRPCQueue("core:conformities.relatedConformity", async ({ data }) => ({
    status: "success",
    data: await Conformities.relatedConformity(data),
  }));

  consumeRPCQueue("core:conformities.filterConformity", async ({ data }) => ({
    status: "success",
    data: await Conformities.filterConformity(data),
  }));

  consumeRPCQueue("core:conformities.changeConformity", async ({ data }) => ({
    status: "success",
    data: await Conformities.changeConformity(data),
  }));

  consumeRPCQueue("core:conformities.findConformities", async ({ data }) => ({
    status: "success",
    data: await Conformities.find(data).lean(),
  }));

  consumeRPCQueue("core:conformities.editConformity", async ({ data }) => ({
    status: "success",
    data: await Conformities.editConformity(data),
  }));

  // graphql subscriptions call =========
  consumeQueue("callPublish", params => {
    graphqlPubsub.publish(params.name, params.data);
  });

  // listen for rpc queue =========
  consumeQueue(
    "core:registerOnboardHistory",
    async ({ subdomain, data: { type, user } }) => {
      const models = await generateModels(subdomain);

      await registerOnboardHistory(models, type, user);
    }
  );

  consumeRPCQueue("core:getConfigs", async ({ subdomain }) => {
    const models = await generateModels(subdomain);

    return {
      status: "success",
      data: await getConfigs(models),
    }
  });

  consumeRPCQueue("core:configs.getValues", async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      status: "success",
      data: await models.Configs.find(data).distinct("value"),
    }
  });

  consumeRPCQueue("core:configs.findOne", async ({ subdomain, data: { query } }) => {
    const models = await generateModels(subdomain);
    
    return {
      status: "success",
      data: await models.Configs.findOne(query),
    }
  });

  consumeRPCQueue(
    "core:getConfig",
    async ({ data: { code, defaultValue } }) => {
      return {
        status: "success",
        data: await getConfig(code, defaultValue),
      };
    }
  );

  consumeRPCQueue('core:users.findOne', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      status: 'success',
      data: await models.Users.findOne(data)
    };
  });

  consumeRPCQueue('core:users.getIds', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      status: 'success',
      data: await models.Users.find(data, { _id: 1 })
    };
  });

  consumeRPCQueue("core:departments.find", async ({ data }) => ({
    status: "success",
    data: await Departments.find(data).lean(),
  }));

  consumeRPCQueue(
    "core:users.updateOne",
    async ({ subdomain, data: { selector, modifier } }) => {
      const models = await generateModels(subdomain);

      return {
        status: "success",
        data: await models.Users.updateOne(selector, modifier),
      };
    }
  );

  consumeRPCQueue("core:users.getCount", async ({ subdomain, data: { query } }) => {
    const models = await generateModels(subdomain);

    return {
      status: "success",
      data: await models.Users.countDocuments(query),
    };
  });

  consumeRPCQueue("core:users.create", async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      status: "success",
      data: await models.Users.createUser(data),
    };
  });

  consumeRPCQueue("core:users.find", async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    const { query, sort = {} } = data;

    return {
      status: "success",
      data: await models.Users.find(query)
        .sort(sort)
        .lean(),
    };
  });

  consumeRPCQueue("core:brands.findOne", async ({ subdomain, data: { query } }) => {
    const models = await generateModels(subdomain);

    return {
      status: "success",
      data: await models.Brands.getBrand(query),
    }
  });

  consumeRPCQueue("core:brands.find", async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    const { query } = data;

    return {
      status: "success",
      data: await models.Brands.find(query).lean(),
    };
  });

  consumeRPCQueue("core:branches.find", async ({ data }) => {
    const { query } = data;

    return {
      status: "success",
      data: await Branches.find(query).lean(),
    };
  });

  consumeRPCQueue("core:getFileUploadConfigs", async ({ subdomain }) => {
    const models = await generateModels(subdomain);
    
    return {
      status: "success",
      data: await getFileUploadConfigs(models),
    };
  });

  logConsumers({
    name: "core",
    consumeRPCQueue,
    getActivityContent: logUtils.getActivityContent,
    collectItems: logUtils.collectItems,
    getSchemalabels: logUtils.getSchemaLabels,
  });

  internalNoteConsumers({
    name: "core",
    consumeRPCQueue,
    generateInternalNoteNotif: internalNotes.generateInternalNoteNotif,
  });

  formConsumers({
    name: "core",
    consumeRPCQueue,
    systemFields: forms.systemFields,
  });

  return client;
};

interface IISendMessageArgs {
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
    subdomain: "os",
    serviceDiscovery,
    client,
    ...args,
  });
};

export const sendIntegrationsMessage = (
  args: ISendMessageArgs
): Promise<any> => {
  return sendMessage({
    client,
    serviceDiscovery,
    serviceName: "integrations",
    ...args,
  });
};

export const sendCardsMessage = (args: ISendMessageArgs): Promise<any> => {
  return sendMessage({
    client,
    serviceDiscovery,
    serviceName: "cards",
    ...args,
  });
};

export const sendLogsMessage = (args: ISendMessageArgs): Promise<any> => {
  return sendMessage({
    client,
    serviceDiscovery,
    serviceName: "logs",
    ...args,
  });
};

export default function() {
  return client;
}
