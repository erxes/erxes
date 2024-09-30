import { generateModels } from "./connectionResolver";
import { getBoardItemLink } from "./models/utils";

export default {
  actions: [
    {
      label: "Deal created",
      action: "create",
      type: "tasks:deal"
    },
    {
      label: "Deal updated",
      action: "update",
      type: "tasks:deal"
    },
    {
      label: "Deal deleted",
      action: "delete",
      type: "tasks:deal"
    },
    {
      label: "Deal moved",
      action: "createBoardItemMovementLog",
      type: "tasks:deal"
    },
    {
      label: "Task created",
      action: "create",
      type: "tasks:task"
    },
    {
      label: "Task updated",
      action: "update",
      type: "tasks:task"
    },
    {
      label: "Task deleted",
      action: "delete",
      type: "tasks:task"
    },
    {
      label: "Task moved",
      action: "createBoardItemMovementLog",
      type: "tasks:task"
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
