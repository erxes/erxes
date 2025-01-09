import { IModels } from "./connectionResolver";
import {
  sendCommonMessage,
  sendCoreMessage,
  sendNotificationsMessage
} from "./messageBroker";

export default {
  "tickets:ticket": ["update", "create"],
  "tasks:task": ["update", "create"],
  "sales:deal": ["update", "create"]
};

export const afterMutationHandlers = async (
  models: IModels,
  subdomain,
  params
) => {
  const {
    type,
    action,
    user,
    newData,
    object: { _id, name }
  } = params;

  //test

  if (action === 'update') {
    if (type.includes('cards')) {
      if (newData.stageId) {
        const contentType = type.replace('cards:', ''); 

        const requests = await models.Requests.find({
          $and: [
            {
              params: {
                $regex: new RegExp(`.*"sourceStageId":"${newData.stageId}".*`)
              }
            },
            {
              params: {
                $regex: new RegExp(`.*"type":"${contentType}".*`)
              }
            }
          ]
        });

        if (!!requests.length) {
          const itemIds: string[] = [];
          const sourceContentTypes: string[] = [];

          for (const request of requests) {
            const params = JSON.parse(request?.params || "{}");

            if (params.itemId && params.sourceType) {
              itemIds.push(params.itemId);
              sourceContentTypes.push(params.sourceType);
            }
          }

          const conformities = await sendCoreMessage({
            subdomain,
            action: "conformities.findConformities",
            data: {
              relType: contentType,
              mainType: { $in: sourceContentTypes },
              mainTypeId: { $in: itemIds }
            },
            isRPC: true,
            defaultValue: []
          });

          const receiverIds: string[] = [];

          for (const conformity of conformities) {
            const request = await models.Requests.findOne({
              contentType: conformity.mainType,
              contentTypeId: conformity.mainTypeId,
              status: "approved"
            });
            if (request) {
              const { configs, itemId, sourceType } = JSON.parse(
                request.params || "{}"
              );

              for (const config of configs || []) {
                if (config.sourceStageId === newData.stageId) {
                  await sendCommonMessage({
                    subdomain,
                    serviceName:contentType,
                    action: "editItem",
                    data: {
                      itemId,
                      type: sourceType,
                      stageId: config.destinationStageId,
                      processId: Math.random(),
                      user
                    }
                  });
                }
              }
              request.requesterId && receiverIds.push(request.requesterId);
            }
          }

          if (!!receiverIds.length) {
            const link = await sendCommonMessage({
              serviceName:contentType,
              subdomain,
              action: 'getLink',
              data: { _id, type: contentType },
              isRPC: true,
              defaultValue: null,
            });

            await sendNotificationsMessage({
              subdomain,
              action: "send",
              data: {
                createdUser: user,
                receivers: receiverIds,
                title: `grant`,
                action: `changed stage of`,
                content: name,
                notifType: "plugin",
                link: link
              }
            });
            sendCoreMessage({
              subdomain: "os",
              action: "sendMobileNotification",
              data: {
                title: `Grant`,
                body: `${
                  user?.details?.fullName || user?.details?.shortName
                } wants ${action}`,
                receivers: receiverIds,
                data: { _id, type: contentType }
              }
            });
          }
        }
      }
    }
  }
};
