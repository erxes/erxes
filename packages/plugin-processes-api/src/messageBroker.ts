import { generateModels } from "./connectionResolver";
import {
  MessageArgs,
  MessageArgsOmitService,
  sendMessage
} from "@erxes/api-utils/src/core";

import { beforeResolverHandlers } from "./beforeResolvers";
import {
  consumeSalesPlans,
  removeFromSalesPlans
} from "./utils/consumeSalesPlans";
import {
  consumeQueue,
  consumeRPCQueue
} from "@erxes/api-utils/src/messageBroker";

export const setupMessageConsumers = async () => {
  consumeQueue(
    "processes:createWorks",
    async ({ subdomain, data: { dayPlans, date, branchId, departmentId } }) => {
      // if (!(branchId && departmentId && date && new Date(date) > new Date())) {
      if (!(branchId && departmentId && date)) {
        throw new Error("not valid data");
      }

      if (!dayPlans || !dayPlans.length) {
        throw new Error("not valid data");
      }

      await sendSalesplansMessage({
        subdomain,
        action: "dayPlans.updateStatus",
        data: { _ids: dayPlans.map(d => d._id), status: "pending" }
      });

      const models = await generateModels(subdomain);

      const qb = new consumeSalesPlans(models, subdomain, {
        dayPlans,
        date,
        branchId,
        departmentId
      });

      await qb.run();
    }
  );

  consumeRPCQueue(
    "processes:removeWorks",
    async ({ subdomain, data: { dayPlans } }) => {
      const models = await generateModels(subdomain);
      return {
        status: "success",
        data: { removedIds: await removeFromSalesPlans(models, dayPlans) }
      };
    }
  );

  consumeRPCQueue("processes:beforeResolver", async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);
    return {
      data: await beforeResolverHandlers(models, data),
      status: "success"
    };
  });

  consumeRPCQueue(
    "processes:findJobProductIds",
    async ({ subdomain, data: { _ids } }) => {
      const models = await generateModels(subdomain);

      const needProductIds = await await models.JobRefers.find({
        "needProducts.productId": { $in: _ids }
      }).distinct("productsData.productId");
      const resProductIds = await await models.JobRefers.find({
        "resultProducts.productId": { $in: _ids }
      }).distinct("productsData.productId");

      return { data: [...needProductIds, ...resProductIds], status: "success" };
    }
  );

  consumeRPCQueue("processes:performs.find", async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);
    return {
      status: "success",
      data: await models.Performs.find(data).lean()
    };
  });

  consumeRPCQueue(
    "processes:performs.aggregate",
    async ({ subdomain, data }) => {
      const models = await generateModels(subdomain);

      const { aggregate, replacers } = data;
      for (const repl of replacers || []) {
        try {
          eval(repl);
        } catch (e) {}
      }

      return {
        status: "success",
        data: await models.Performs.aggregate(aggregate)
      };
    }
  );
};

export const sendCommonMessage = async (
  args: MessageArgs & { serviceName: string }
): Promise<any> => {
  return sendMessage({
    ...args
  });
};

export const sendInventoriesMessage = async (
  args: MessageArgsOmitService
): Promise<any> => {
  return sendMessage({
    serviceName: "inventories",
    ...args
  });
};

export const sendSalesplansMessage = async (
  args: MessageArgsOmitService
): Promise<any> => {
  return sendMessage({
    serviceName: "salesplans",
    ...args
  });
};

export const sendCoreMessage = async (
  args: MessageArgsOmitService
): Promise<any> => {
  return sendMessage({
    serviceName: "core",
    ...args
  });
};
