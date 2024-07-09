import { generateModels } from "./connectionResolver";
import { getBoardItemLink } from "./models/utils";

export default {
  actions: [
    {
      label: "Deal created",
      action: "create",
      type: "purchases:deal"
    },
    {
      label: "Deal updated",
      action: "update",
      type: "purchases:deal"
    },
    {
      label: "Deal deleted",
      action: "delete",
      type: "purchases:deal"
    },
    {
      label: "Deal moved",
      action: "createBoardItemMovementLog",
      type: "purchases:deal"
    },
    {
      label: "Purchase created",
      action: "create",
      type: "purchases:purchase"
    },
    {
      label: "Purchase updated",
      action: "update",
      type: "purchases:purchase"
    },
    {
      label: "Purchase deleted",
      action: "delete",
      type: "purchases:purchase"
    },
    {
      label: "Purchase moved",
      action: "createBoardItemMovementLog",
      type: "purchases:purchase"
    }
  ],
  getInfo: async ({
    subdomain,
    data: { data, contentType, actionText, action }
  }) => {
    const models = await generateModels(subdomain);

    if (action === "createBoardItemMovementLog") {
      return {
        content: `${contentType} with name ${
          data.data.item.name || ""
        } has moved from ${data.data.activityLogContent.text}`,
        url: data.data.link
      };
    }

    if (!["create", "update"].includes(action)) {
      return {
        content: `${contentType} ${actionText}`,
        url: ""
      };
    }

    const { object } = data;

    return {
      url: await getBoardItemLink(models, object.stageId, object._id),
      content: `${contentType} ${actionText}`
    };
  }
};
