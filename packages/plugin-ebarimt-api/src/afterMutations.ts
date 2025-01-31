import graphqlPubsub from "@erxes/api-utils/src/graphqlPubsub";
import * as moment from "moment";
import { nanoid } from "nanoid";
import { IModels } from "./connectionResolver";
import { IDoc, getEbarimtData } from "./models/utils";
import { getConfig, getPostData } from "./utils";
import { sendSalesMessage } from "./messageBroker";

export default {
  "sales:deal": ["update"]
};

export const afterMutationHandlers = async (
  models: IModels,
  subdomain,
  params
) => {
  const { type, action, user } = params;

  if (type === "sales:deal") {
    if (action === "update") {
      const deal = params.updatedDocument;
      const oldDeal = params.object;
      const destinationStageId = deal.stageId || "";

      if (!(destinationStageId && destinationStageId !== oldDeal.stageId)) {
        return;
      }

      const configs = await getConfig(subdomain, "stageInEbarimt", {});
      // return *********
      const returnConfigs = await getConfig(
        subdomain,
        "returnStageInEbarimt",
        {}
      );

      if (Object.keys(returnConfigs).includes(destinationStageId)) {
        const returnConfig = {
          ...returnConfigs[destinationStageId],
          ...(await getConfig(subdomain, "EBARIMT", {}))
        };

        const returnResponses = await models.PutResponses.returnBill(
          {
            ...deal,
            contentType: "deal",
            contentId: deal._id,
            number: deal.number
          },
          returnConfig
        );

        if (returnResponses.length) {
          try {
            await graphqlPubsub.publish(`automationResponded:${user._id}`, {
              automationResponded: {
                userId: user._id,
                responseId: returnResponses.map(er => er._id).join("-"),
                sessionCode: user.sessionCode || "",
                content: returnResponses
              }
            });
          } catch (e) {
            throw new Error(e.message);
          }
        }

        return;
      }

      // put *******
      if (!Object.keys(configs).includes(destinationStageId)) {
        return;
      }

      const config = {
        ...(await getConfig(subdomain, "EBARIMT", {})),
        ...configs[destinationStageId]
      };

      const pipeline = await sendSalesMessage({
        subdomain,
        action: 'pipelines.findOne',
        data: { stageId: destinationStageId },
        isRPC: true,
        defaultValue: {}
      });

      const ebarimtData: IDoc = await getPostData(subdomain, models, config, deal, pipeline.paymentTypes);

      const ebarimtResponses: any[] = [];

      if (config.skipPutData) {
        const { status, msg, data, innerData } = await getEbarimtData({
          config,
          doc: ebarimtData
        });

        if (status !== "ok" || (!data && !innerData)) {
          ebarimtResponses.push({
            _id: nanoid(),
            id: "Error",
            status: "ERROR",
            message: msg
          });
        } else {
          if (data) {
            ebarimtResponses.push({
              _id: nanoid(),
              ...data,
              id: "Түр баримт",
              status: "SUCCESS",
              date: moment(new Date()).format('"yyyy-MM-dd HH:mm:ss'),
              registerNo: config.companyRD || ""
            });
          }
          if (innerData) {
            ebarimtResponses.push({
              ...innerData,
              id: "Түр баримт",
              status: "SUCCESS",
              date: moment(new Date()).format('"yyyy-MM-dd HH:mm:ss'),
              registerNo: config.companyRD || ""
            });
          }
        }
      } else {
        try {
          const { putData, innerData } = await models.PutResponses.putData(
            ebarimtData,
            config
          );

          putData && ebarimtResponses.push(putData);
          innerData && ebarimtResponses.push(innerData);
        } catch (e) {
          ebarimtResponses.push({
            _id: nanoid(),
            id: "Error",
            status: "ERROR",
            message: e.message
          });
        }
      }

      try {
        if (ebarimtResponses.length) {
          await graphqlPubsub.publish(`automationResponded:${user._id}`, {
            automationResponded: {
              userId: user._id,
              responseId: ebarimtResponses.map(er => er._id).join("-"),
              sessionCode: user.sessionCode || "",
              content: ebarimtResponses.map(er => ({
                ...config,
                ...er,
                description: config.withDescription && deal.description || ''
              }))
            }
          });
        }
      } catch (e) {
        throw new Error(e.message);
      }

      return;
    }
  }
};
