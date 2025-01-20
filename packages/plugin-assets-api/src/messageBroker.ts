import { sendMessage } from "@erxes/api-utils/src/core";
import type { MessageArgsOmitService } from "@erxes/api-utils/src/core";
import { generateModels } from "./connectionResolver";
import { consumeRPCQueue } from "@erxes/api-utils/src/messageBroker";
import { getLasthistoryEachAssets } from "./utils";

export const setupMessageConsumers = async () => {
  consumeRPCQueue("assets:assets.find", async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      status: "success",
      data: await models.Assets.find(data).lean()
    };
  });

  consumeRPCQueue(
    "assets:assets.getKbArticleHistoriesPerAsset",
    async ({ subdomain, data }) => {
      const models = await generateModels(subdomain);

      return {
        status: "success",
        data: await getLasthistoryEachAssets(models, data)
      };
    }
  );

  consumeRPCQueue(
    "assets:assets.findByMovements",
    async ({ subdomain, data: { query, params } }) => {
      const models = await generateModels(subdomain);

      if (params.onlyCurrent) {
        let pipeline: any = [];

        if (query?.assetId?.$in?.length) {
          pipeline = [
            { $match: { assetId: { $in: query.assetId.$in || [] } } }
          ];
        }

        pipeline = [
          ...pipeline,
          {
            $group: {
              _id: "$assetId",
              movements: {
                $push: "$$ROOT"
              }
            }
          },
          { $unwind: "$movements" },
          { $sort: { "movements.createdAt": -1 } },
          { $group: { _id: "$_id", movements: { $push: "$movements" } } },
          { $replaceRoot: { newRoot: { $arrayElemAt: ["$movements", 0] } } }
        ];

        const movements = await models?.MovementItems.aggregate(pipeline);

        const movementIds = movements?.map((movement) => movement._id);
        query._id = { $in: movementIds };
      }

      const assetIds =
        await models.MovementItems.find(query).distinct("assetId");

      return {
        status: "success",
        data: await models.Assets.find({ _id: { $in: assetIds } })
      };
    }
  );
};

export const sendSalesMessage = (
  args: MessageArgsOmitService
): Promise<any> => {
  return sendMessage({
    serviceName: "sales",
    ...args
  });
};

export const sendCoreMessage = (args: MessageArgsOmitService): Promise<any> => {
  return sendMessage({
    serviceName: "core",
    ...args
  });
};

export const sendKbMessage = (args: MessageArgsOmitService): Promise<any> => {
  return sendMessage({
    serviceName: "knowledgebase",
    ...args
  });
};
