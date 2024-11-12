import {
  MessageArgs,
  MessageArgsOmitService,
  sendMessage
} from "@erxes/api-utils/src/core";

import { generateModels } from "./connectionResolver";
import { IXypConfig } from "./graphql/resolvers/queries";
import fetch from "node-fetch";
import {
  InterMessage,
  RPResult,
  consumeRPCQueue
} from "@erxes/api-utils/src/messageBroker";

export const setupMessageConsumers = async () => {
  consumeRPCQueue(
    "xyp:fetch",
    async ({ subdomain, data }: InterMessage): Promise<RPResult> => {
      const xypConfigs = await sendCommonMessage({
        subdomain,
        serviceName: "core",
        action: "configs.findOne",
        data: {
          query: {
            code: "XYP_CONFIGS"
          }
        },
        isRPC: true,
        defaultValue: null
      });

      if (!xypConfigs) {
        return {
          status: "error",
          errorMessage: "XYP CONFIGS not found"
        };
      }

      const { params, wsOperationName } = data;

      const config: IXypConfig = xypConfigs && xypConfigs.value;

      const response = await fetch(config.url + "/api", {
        method: "post",
        headers: { token: config.token, "Content-Type": "application/json" },
        body: JSON.stringify({
          params,
          wsOperationName
        }),
        timeout: 5000
      });

      return {
        status: "success",
        data: response
      };
    }
  );

  consumeRPCQueue("xyp.find", async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      status: "success",
      data: await models.XypData.findOne({
        contentType: data?.contentType,
        contentTypeId: data?._id
      })
    };
  });
  consumeRPCQueue("xyp:insertOrUpdate", async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    const existingData = await models.XypData.findOne({
      contentType: data.contentType,
      contentTypeId: data.contentTypeId
    });

    const newData = data.data;

    if (!existingData) {
      return {
        status: "success",
        data: await models.XypData.createXypData(data)
      };
    }

    for (const obj of newData) {
      const serviceIndex = existingData.data.findIndex(
        e => e.serviceName === obj.serviceName
      );

      if (serviceIndex === -1) {
        await models.XypData.updateOne(
          { _id: existingData._id },
          {
            $push: {
              data: obj
            }
          }
        );
      } else {
        existingData.data[serviceIndex] = obj;
        await models.XypData.updateOne(
          { _id: existingData._id },
          {
            $set: {
              data: existingData.data
            }
          }
        );
      }
    }

    return {
      status: "success",
      data: await models.XypData.findOne({
        contentType: data.contentType,
        contentTypeId: data.contentTypeId
      })
    };
  });
};

export const sendAutomationsMessage = async (
  args: MessageArgsOmitService
): Promise<any> => {
  return sendMessage({
    serviceName: "automations",
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

export const sendCoreMessage = async (
  args: MessageArgsOmitService
): Promise<any> => {
  return sendMessage({
    serviceName: "core",
    ...args
  });
};
