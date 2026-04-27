import graphqlPubsub from "@erxes/api-utils/src/graphqlPubsub";
import { IModels } from "../connectionResolver";
import { itemResolver } from "../graphql/resolvers/mutations/utils";

export const publishTicketsPipelineItemsUpdated = async ({
  models,
  subdomain,
  itemIds,
  proccessId,
  previousStageIds
}: {
  models: IModels;
  subdomain: string;
  itemIds: string[];
  proccessId?: string;
  previousStageIds?: { [itemId: string]: string };
}) => {
  for (const itemId of itemIds) {
    const item = await models.Tickets.findOne({ _id: itemId });

    if (!item) {
      continue;
    }

    const stage = await models.Stages.getStage(item.stageId);
    const previousStageId = previousStageIds?.[itemId];

    if (previousStageId && previousStageId !== item.stageId) {
      const previousStage = await models.Stages.getStage(previousStageId);

      graphqlPubsub.publish(
        `ticketsPipelinesChanged:${previousStage.pipelineId}`,
        {
          ticketsPipelinesChanged: {
            _id: previousStage.pipelineId,
            proccessId,
            action: "itemRemove",
            data: {
              item,
              oldStageId: previousStageId
            }
          }
        }
      );

      graphqlPubsub.publish(`ticketsPipelinesChanged:${stage.pipelineId}`, {
        ticketsPipelinesChanged: {
          _id: stage.pipelineId,
          proccessId,
          action: "itemAdd",
          data: {
            item: {
              ...item.toObject(),
              ...(await itemResolver(models, subdomain, null, "ticket", item))
            },
            aboveItemId: "",
            destinationStageId: stage._id
          }
        }
      });

      continue;
    }

    graphqlPubsub.publish(`ticketsPipelinesChanged:${stage.pipelineId}`, {
      ticketsPipelinesChanged: {
        _id: stage.pipelineId,
        proccessId,
        action: "itemUpdate",
        data: {
          item: {
            ...item.toObject(),
            ...(await itemResolver(models, subdomain, null, "ticket", item))
          }
        }
      }
    });
  }
};
