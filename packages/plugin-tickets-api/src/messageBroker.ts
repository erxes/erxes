import type {
  MessageArgs,
  MessageArgsOmitService
} from "@erxes/api-utils/src/core";
import {
  consumeQueue,
  consumeRPCQueue
} from "@erxes/api-utils/src/messageBroker";
import {
  conversationConvertToCard,
  createBoardItem,
  updateName
} from "./models/utils";
import {
  createConformity,
  notifiedUserIds,
  sendNotifications
} from "./graphql/utils";
import { itemsEdit, publishHelper } from "./graphql/resolvers/mutations/utils";

import { checkItemPermByUser } from "../src/graphql/resolvers/queries/utils";
import { generateModels } from "./connectionResolver";
import { getCardItem } from "./utils";
import graphqlPubsub from "@erxes/api-utils/src/graphqlPubsub";
import { itemsAdd } from "../src/graphql/resolvers/mutations/utils";
import { sendMessage } from "@erxes/api-utils/src/core";

export const setupMessageConsumers = async () => {
  consumeRPCQueue("tickets:tickets.create", async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);
    const tickets = await models.Tickets.create(data);

    const { customerId = "" } = data;

    if (customerId) {
      await createConformity(subdomain, {
        customerIds: [customerId],
        mainType: "ticket",
        mainTypeId: tickets._id
      });
    }
    return {
      status: "success",
      data: tickets
    };
  });

  consumeRPCQueue("tickets:editItem", async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    const objModels = {
      ticket: models.Tickets
    };

    const { itemId, processId, type, user, ...doc } = data;

    if (!itemId || !type || !user || !processId) {
      return {
        status: "error",
        errorMessage: "you must provide some params"
      };
    }
    const collection = objModels[type];

    const oldItem = await collection.findOne({ _id: itemId });
    const typeUpperCase = type.charAt(0).toUpperCase() + type.slice(1);

    return {
      status: "success",
      data: await itemsEdit(
        models,
        subdomain,
        itemId,
        type,
        oldItem,
        doc,
        processId,
        user,
        collection[`update${typeUpperCase}`]
      )
    };
  });

  consumeRPCQueue("tickets:createChildItem", async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    const { type, itemId, ...doc } = data;

    const parent = await getCardItem(models, {
      contentType: type,
      contentTypeId: itemId
    });

    if (!parent) {
      return {
        status: "error",
        errorMessage: "Parent not found"
      };
    }

    const childCard = await createBoardItem(
      models,
      subdomain,
      { parentId: itemId, stageId: parent.stageId, ...doc },
      type
    );

    return {
      status: "success",
      data: childCard
    };
  });

  consumeRPCQueue("tickets:createRelatedItem", async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    const { type, sourceType, itemId, name, stageId } = data;

    const relatedCard = await createBoardItem(
      models,
      subdomain,
      { name, stageId },
      type
    );

    await sendCoreMessage({
      subdomain,
      action: "conformities.addConformity",
      data: {
        mainType: sourceType,
        mainTypeId: itemId,
        relType: type,
        relTypeId: relatedCard._id
      }
    });

    return {
      status: "success",
      data: relatedCard
    };
  });

  consumeRPCQueue(
    "tickets:tickets.remove",
    async ({ subdomain, data: { _ids } }) => {
      const models = await generateModels(subdomain);

      return {
        status: "success",
        data: await models.Tickets.removeTickets(_ids)
      };
    }
  );

  consumeRPCQueue("tickets:stages.find", async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      status: "success",
      data: await models.Stages.find(data).sort({ order: 1 }).lean()
    };
  });

  consumeRPCQueue("tickets:stages.findOne", async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      status: "success",
      data: await models.Stages.findOne(data).lean()
    };
  });

  consumeRPCQueue("tickets:pipelines.find", async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      status: "success",
      data: await models.Pipelines.find(data).lean()
    };
  });

  consumeRPCQueue("tickets:boards.find", async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      status: "success",
      data: await models.Boards.find(data).lean()
    };
  });

  consumeRPCQueue("tickets:boards.findOne", async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      status: "success",
      data: await models.Boards.findOne(data).lean()
    };
  });

  consumeRPCQueue(
    "tickets:boards.count",
    async ({ subdomain, data: { selector } }) => {
      const models = await generateModels(subdomain);

      return {
        status: "success",
        data: await models.Boards.find(selector).countDocuments()
      };
    }
  );

  consumeQueue(
    "tickets:checklists.removeChecklists",
    async ({ subdomain, data: { type, itemIds } }) => {
      const models = await generateModels(subdomain);

      return {
        status: "success",
        data: await models.Checklists.removeChecklists(type, itemIds)
      };
    }
  );

  consumeRPCQueue(
    "tickets:conversationConvert",
    async ({ subdomain, data }) => {
      const models = await generateModels(subdomain);

      return {
        status: "success",
        data: await conversationConvertToCard(models, subdomain, data)
      };
    }
  );

  consumeRPCQueue("tickets:tickets.find", async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    if (!data.query) {
      return {
        status: "success",
        data: await models.Tickets.find(data).lean()
      };
    }

    const { query, skip, limit, sort = {} } = data;

    return {
      status: "success",
      data: await models.Tickets.find(query)
        .skip(skip || 0)
        .limit(limit || 20)
        .sort(sort)
        .lean()
    };
  });

  consumeRPCQueue("tickets:tickets.count", async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      status: "success",
      data: await models.Tickets.find(data).countDocuments()
    };
  });

  consumeRPCQueue("tickets:tickets.findOne", async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      status: "success",
      data: await models.Tickets.findOne(data).lean()
    };
  });
  consumeRPCQueue("tickets:updateName", async ({ subdomain, data }) => {
    await updateName(subdomain, data.mainType, data.itemId);
    return {
      status: "success",
      data: {}
    };
  });


  consumeRPCQueue("tickets:widgets.createTicket", async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);
    const { doc } = data;
    const customerIds = doc.customerIds || [];

    const customer = await sendCoreMessage({
      subdomain,
      action: "customers.find",
      data: {
        _id: { $in: customerIds },
      },
      isRPC: true,
      defaultValue: null
    });
    return {
      status: "success",
      data: await itemsAdd(
        models,
        subdomain,
        doc,
        "ticket",
        models.Tickets.createTicket,
        customer
      )
    };
  });
  consumeRPCQueue("tickets:widgets.fetchTicketProgress", async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);
    const { number, user } = data;
    if (!number) {
      throw new Error("Ticket number is required");
    }

    const ticket = await models.Tickets.findOne({ number });

    if (!ticket) {
      throw new Error("Ticket not found");
    }
    const result = await checkItemPermByUser(subdomain, models, user, ticket);
    return {
      status: "success",
      data: result
    };
  });


  consumeRPCQueue("tickets:widgets.fetchTicketProgressForget", async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);
    const { email, phoneNumber } = data;
    const field = email ? 'emails' : phoneNumber ? 'phones' : null;
    const value = email || phoneNumber;

    const customer = field
      ? await sendCoreMessage({
        subdomain,
        action: "customers.findOne",
        data: { [field]: value },
        isRPC: true,
        defaultValue: null
      })
      : null;
    if (!customer) {
      throw new Error("Customer not found");
    }
    const customerIds = [customer._id];
    const mainTypeIds = await sendCoreMessage({
      subdomain,
      action: "conformities.findConformities",
      data: {
        mainType: "ticket",
        relType: "customer",
        relTypeId: customerIds
      },
      isRPC: true,
      defaultValue: []
    });
    const ticketIds = mainTypeIds.map((mainType) => mainType.mainTypeId);

    const tickets = await models.Tickets.find({
      _id: { $in: ticketIds },
      number: { $exists: true, $ne: null }
    });
    const formattedTickets = tickets.map((ticket) => ({
      userId: ticket.userId,
      name: ticket.name,
      stageId: ticket.stageId,
      number: ticket.number,
      type: ticket.type
    }));
    return {
      status: "success",
      data: formattedTickets
    };
  });
  consumeRPCQueue("tickets:widgets.commentAdd", async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);
    const { type, typeId, content, userType, customerId } = data;
    const comment = await models.Tickets.createTicketComment(type, typeId, content, userType, customerId)
    return {
      status: "success",
      data: comment
    };
  });
  consumeRPCQueue("tickets:widgets.comment.remove", async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);
    const { _id } = data;
    await models.Comments.deleteComment(_id)
    return {
      status: "success",
    };
  });
  consumeRPCQueue("tickets:widgets.comments.find", async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);
    const { typeId } = data;
    const comment = await models.Comments.getComment(typeId)
    return {
      status: "success",
      data: comment
    };
  });
  consumeRPCQueue("tickets:findItem", async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return { data: await getCardItem(models, data), status: "success" };
  });

  consumeRPCQueue(
    "tickets:findTicketProductIds",
    async ({ subdomain, data: { _ids } }) => {
      const models = await generateModels(subdomain);

      const ticketProductIds = await await models.Tickets.find({
        "productsData.productId": { $in: _ids }
      }).distinct("productsData.productId");

      return { data: ticketProductIds, status: "success" };
    }
  );

  consumeRPCQueue(
    "tickets:tickets.updateMany",
    async ({ subdomain, data: { selector, modifier } }) => {
      const models = await generateModels(subdomain);

      return {
        data: await models.Tickets.updateMany(selector, modifier),
        status: "success"
      };
    }
  );

  consumeRPCQueue(
    "tickets:tickets.updateOne",
    async ({ subdomain, data: { selector, modifier } }) => {
      const models = await generateModels(subdomain);

      return {
        data: await models.Tickets.updateOne(selector, modifier),
        status: "success"
      };
    }
  );

  consumeRPCQueue("tickets:notifiedUserIds", async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      status: "success",
      data: await notifiedUserIds(models, data)
    };
  });

  consumeRPCQueue("tickets:sendNotifications", async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      status: "success",
      data: await sendNotifications(models, subdomain, data)
    };
  });

  consumeRPCQueue(
    "tickets:getLink",
    async ({ subdomain, data: { _id, type } }) => {
      const models = await generateModels(subdomain);

      const item = await getCardItem(models, {
        contentTypeId: _id,
        contentType: type
      });

      if (!item) {
        return {
          status: "error",
          errorMessage: "Item not found"
        };
      }

      const stage = await models.Stages.getStage(item.stageId);
      const pipeline = await models.Pipelines.getPipeline(stage.pipelineId);
      const board = await models.Boards.getBoard(pipeline.boardId);

      return {
        status: "success",
        data: `/${stage.type}/board?id=${board._id}&pipelineId=${pipeline._id}&itemId=${_id}`
      };
    }
  );

  consumeRPCQueue(
    "tickets:pipelines.findOne",
    async ({ subdomain, data: { _id, stageId } }) => {
      let pipelineId = _id;
      const models = await generateModels(subdomain);
      if (!pipelineId && stageId) {
        const stage = await models.Stages.findOne({ _id: stageId }).lean();
        if (stage) {
          pipelineId = stage.pipelineId;
        }
      }

      if (!pipelineId) {
        return {
          status: "error",
          errorMessage: "Pipeline not found"
        };
      }

      return {
        status: "success",
        data: await models.Pipelines.getPipeline(pipelineId)
      };
    }
  );

  consumeRPCQueue(
    "tickets:pipelineLabels.find",
    async ({ subdomain, data: { query, fields } }) => {
      const models = await generateModels(subdomain);

      return {
        status: "success",
        data: await models.PipelineLabels.find(query, fields)
      };
    }
  );

  consumeQueue(
    "tickets:ticketsPipelinesChanged",
    async ({ subdomain, data: { pipelineId, action, data } }) => {
      graphqlPubsub.publish("ticketsPipelinesChanged", {
        ticketsPipelinesChanged: {
          _id: pipelineId,
          proccessId: Math.random(),
          action,
          data
        }
      });

      return {
        status: "success"
      };
    }
  );

  consumeQueue(
    "tickets:publishHelperItems",
    async ({ subdomain, data: { addedTypeIds, removedTypeIds, doc } }) => {
      const targetTypes = ["ticket"];
      const targetRelTypes = ["company", "customer"];

      if (
        targetTypes.includes(doc.mainType) &&
        targetRelTypes.includes(doc.relType)
      ) {
        await publishHelper(subdomain, doc.mainType, doc.mainTypeId);
      }

      if (
        targetTypes.includes(doc.relType) &&
        targetRelTypes.includes(doc.mainType)
      ) {
        for (const typeId of addedTypeIds.concat(removedTypeIds)) {
          await publishHelper(subdomain, doc.relType, typeId);
        }
      }
      if (targetTypes.includes(doc.mainType)) {
        await updateName(subdomain, doc.mainType, doc.mainTypeId);
      }

      return {
        status: "success"
      };
    }
  );

  consumeRPCQueue(
    "tickets:getModuleRelation",
    async ({ subdomain, data: { module, target, triggerType } }) => {
      let filter;

      if (module.includes("contacts")) {
        const relTypeIds = await sendCommonMessage({
          subdomain,
          serviceName: "core",
          action: "conformities.savedConformity",
          data: {
            mainType: triggerType.split(":")[1],
            mainTypeId: target._id,
            relTypes: [module.split(":")[1]]
          },
          isRPC: true,
          defaultValue: []
        });

        if (relTypeIds.length) {
          filter = { _id: { $in: relTypeIds } };
        }
      }

      return {
        status: "success",
        data: filter
      };
    }
  );
};

export const sendInternalNotesMessage = async (
  args: MessageArgsOmitService
): Promise<any> => {
  return sendMessage({
    serviceName: "internalnotes",
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

export const sendEngagesMessage = async (
  args: MessageArgsOmitService
): Promise<any> => {
  return sendMessage({
    serviceName: "engages",
    ...args
  });
};

export const sendInboxMessage = async (
  args: MessageArgsOmitService
): Promise<any> => {
  return sendMessage({
    serviceName: "inbox",
    ...args
  });
};

export const sendNotificationsMessage = async (
  args: MessageArgsOmitService
): Promise<any> => {
  return sendMessage({
    serviceName: "notifications",
    ...args
  });
};

export const sendLoyaltiesMessage = async (
  args: MessageArgsOmitService
): Promise<any> => {
  return sendMessage({
    serviceName: "loyalties",
    ...args
  });
};

export const sendTasksMessage = async (
  args: MessageArgsOmitService
): Promise<any> => {
  return sendMessage({
    serviceName: "tasks",
    ...args
  });
};

export const sendCommonMessage = async (args: MessageArgs): Promise<any> => {
  return sendMessage({
    ...args
  });
};

export const fetchSegment = (
  subdomain: string,
  segmentId: string,
  options?,
  segmentData?: any
) =>
  sendCoreMessage({
    subdomain,
    action: "fetchSegment",
    data: { segmentId, options, segmentData },
    isRPC: true
  });
