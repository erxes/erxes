import { IModels } from "../connectionResolver";
import {
  sendPurchasesMessage,
  sendSalesMessage,
  sendTasksMessage,
  sendTicketsMessage,
} from "../messageBroker";
import { sendNotification } from "../utils";
import { IUserDocument } from "@erxes/api-utils/src/types";

export const cardUpdateHandler = async (models: IModels, subdomain, params) => {
  const { type, object } = params;
  const cardType = type.split(":")[1];

  const prevStageId = object.stageId;
  const card = params.updatedDocument;
  const oldCard = params.object;
  const destinationStageId = card.stageId || "";

  const oldStatus = oldCard.status;
  const newStatus = card.status;
  let content = "";

  if (
    !(destinationStageId && destinationStageId !== oldCard.stageId) &&
    oldStatus === newStatus
  ) {
    return;
  }
  const userIds = await models.ClientPortalUserCards.getUserIds(
    cardType,
    card._id
  );

  if (userIds.length === 0) {
    return;
  }

  let stage;
  let prevStage;

  switch (cardType) {
    case "deal":
      stage = await sendSalesMessage({
        subdomain,
        action: "stages.findOne",
        data: { _id: destinationStageId },
        isRPC: true,
        defaultValue: {},
      });

      prevStage = await sendSalesMessage({
        subdomain,
        action: "stages.findOne",
        data: { _id: prevStageId },
        isRPC: true,
        defaultValue: {},
      });
      break;

    case "ticket":
      stage = await sendTicketsMessage({
        subdomain,
        action: "stages.findOne",
        data: { _id: destinationStageId },
        isRPC: true,
        defaultValue: {},
      });

      prevStage = await sendTicketsMessage({
        subdomain,
        action: "stages.findOne",
        data: { _id: prevStageId },
        isRPC: true,
        defaultValue: {},
      });
      break;

    case "purchase":
      stage = await sendPurchasesMessage({
        subdomain,
        action: "stages.findOne",
        data: { _id: destinationStageId },
        isRPC: true,
        defaultValue: {},
      });

      prevStage = await sendPurchasesMessage({
        subdomain,
        action: "stages.findOne",
        data: { _id: prevStageId },
        isRPC: true,
        defaultValue: {},
      });
      break;

    case "task":
      stage = await sendTasksMessage({
        subdomain,
        action: "stages.findOne",
        data: { _id: destinationStageId },
        isRPC: true,
        defaultValue: {},
      });

      prevStage = await sendTasksMessage({
        subdomain,
        action: "stages.findOne",
        data: { _id: prevStageId },
        isRPC: true,
        defaultValue: {},
      });
      break;

    default:
      // Optional: Handle unknown card types.
      throw new Error(`Unsupported cardType: ${cardType}`);
  }

  // Logging the stage names
  content = `${cardType.charAt(0).toUpperCase() + cardType.slice(1)} ${
    card.name
  } has been moved from ${prevStage?.name} to ${stage?.name} stage`;

  if (newStatus !== oldStatus && newStatus === "archived") {
    content = `Your ${cardType} named ${card.name} has been archived`;
  }

  if (newStatus !== oldStatus && newStatus === "active") {
    content = `Your ${cardType} named ${card.name} has been activated`;
  }

  const users = await models.ClientPortalUsers.find({
    _id: { $in: userIds },
  }).lean();
  for (const user of users) {
    const config = await models.ClientPortals.findOne({
      _id: user.clientPortalId,
    });

    if (!config) {
      continue;
    }
    const baseNotification = {
      receivers: [user._id],
      title: `Your submitted ${cardType} has been updated`,
      content,
      notifType: "system" as const,
      type: cardType,
    };

    let link: string;
    let extraFields = {};

    if (cardType === "ticket") {
      link = `ticket/board?id=${card.boardId}&pipelineId=${card.pipelineId}&itemId=${card._id}`;

      extraFields = {
        isMobile: false,
        eventData: {
          ticketId: card._id,
          ticketTitle: card.title || card.name,
          ticketStatus: card.status || "new",
          ticketStageId: card.stageId,
          ticketStageName: card.stageName || "",
          ticketPriority: card.priority || "normal",
        },
        createdUser: user as IUserDocument,
      };
    } else {
      link = `${config.url}/${cardType}s?stageId=${destinationStageId}`;
    }

    await sendNotification(models, subdomain, {
      ...baseNotification,
      link,
      ...extraFields,
    });
  }

  return;
};

export const cardDeleteHandler = async (models: IModels, subdomain, params) => {
  const { type } = params;

  const cardType = type.split(":")[1];

  const card = params.object;

  const userIds = await models.ClientPortalUserCards.getUserIds(
    cardType,
    card._id
  );

  await models.ClientPortalUserCards.deleteMany({ cardId: card._id });

  if (userIds.length === 0) {
    return;
  }

  const users = await models.ClientPortalUsers.find({
    _id: { $in: userIds },
  }).lean();

  for (const user of users) {
    const config = await models.ClientPortals.findOne({
      _id: user.clientPortalId,
    });

    if (!config) {
      continue;
    }

    await sendNotification(models, subdomain, {
      receivers: [user._id],
      title: `Your submitted ${cardType} has been deleted`,
      content: `${cardType.charAt(0).toUpperCase() + cardType.slice(1)} ${
        card.name
      } has been deleted`,
      notifType: "system",
      link: `${config.url}/${cardType}s`,
    });
  }

  return;
};
