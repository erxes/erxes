import { setProperty } from "@erxes/api-utils/src/automations";
import { generateModels, IModels } from "./connectionResolver";
import { sendCommonMessage, sendCoreMessage } from "./messageBroker";

const getRelatedValue = async (
  models: IModels,
  subdomain: string,
  target,
  targetKey
) => {
  if (
    [
      "userId",
      "assignedUserId",
      "closedUserId",
      "ownerId",
      "createdBy",
    ].includes(targetKey)
  ) {
    const user = await sendCoreMessage({
      subdomain,
      action: "users.findOne",
      data: { _id: target[targetKey] },
      isRPC: true,
    });

    return (
      (user && ((user.detail && user.detail.fullName) || user.email)) || ""
    );
  }

  if (
    ["participatedUserIds", "assignedUserIds", "watchedUserIds"].includes(
      targetKey
    )
  ) {
    const users = await sendCoreMessage({
      subdomain,
      action: 'users.find',
      data: {
        query: {
          _id: { $in: target[targetKey] }
        }
      },
      isRPC: true
    });

    return (
      users.map(
        (user) => (user.detail && user.detail.fullName) || user.email
      ) || []
    ).join(", ");
  }

  if (targetKey === "tagIds") {
    const tags = await sendCommonMessage({
      subdomain,
      serviceName: "tags",
      action: "find",
      data: { _id: { $in: target[targetKey] } },
    });

    return (tags.map((tag) => tag.name) || []).join(", ");
  }

  return false;
};

export default {
  receiveActions: async ({
    subdomain,
    data: { action, execution, triggerType, actionType },
  }) => {
    const models = await generateModels(subdomain);

    if (actionType === "set-property") {
      return setProperty({
        models,
        subdomain,
        getRelatedValue,
        action,
        execution,
        triggerType,
        sendCommonMessage,
      });
    }
  },
};
