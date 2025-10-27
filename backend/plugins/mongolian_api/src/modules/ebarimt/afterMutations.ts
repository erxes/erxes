import moment from "moment";
import { nanoid } from "nanoid";
import { graphqlPubsub, sendTRPCMessage } from "../../../../../erxes-api-shared/src/utils";

import { IModels } from "./connectionResolver";
import { IDoc, getEbarimtData } from "./db/models/Ebarimt";
import { getConfig, getPostData } from "./utils";

export default {
  "sales:deal": ["update"],
};

export const afterMutationHandlers = async (models: IModels, params) => {
  const { type, action, user, updatedDocument: deal, object: oldDeal } = params;

  if (type !== "sales:deal" || action !== "update") {
    return;
  }

  const destinationStageId = deal.stageId || "";

  // Stop if the stage hasn’t changed
  if (!destinationStageId || destinationStageId === oldDeal.stageId) {
    return;
  }

  // --- Load stage-related configurations ---
  const configs = await getConfig("stageInEbarimt", {});
  const returnConfigs = await getConfig("returnStageInEbarimt", {});

  /*RETURN BILL LOGIC*/
  if (Object.keys(returnConfigs).includes(destinationStageId)) {
    const returnConfig = {
      ...returnConfigs[destinationStageId],
      ...(await getConfig("EBARIMT", {})),
    };

    const returnResponses = await models.PutResponses.returnBill(
      {
        ...deal,
        contentType: "deal",
        contentId: deal._id,
        number: deal.number,
      },
      returnConfig,
      user
    );

    if (returnResponses.length) {
      try {
        await graphqlPubsub.publish(`automationResponded:${user._id}`, {
          automationResponded: {
            userId: user._id,
            responseId: returnResponses.map((r) => r._id).join("-"),
            sessionCode: user.sessionCode || "",
            content: returnResponses,
          },
        });
      } catch (e) {
        throw new Error(e.message);
      }
    }

    return;
  }

  /*NORMAL BILL LOGIC*/
  if (!Object.keys(configs).includes(destinationStageId)) {
    return;
  }

  const config = {
    ...(await getConfig("EBARIMT", {})),
    ...configs[destinationStageId],
  };

  // --- Get related pipeline (with TRPC) ---
  const pipeline = await sendTRPCMessage({
    pluginName: "sales",
    module: "pipelines",
    action: "findOne",
    method: "query",
    input: { stageId: destinationStageId },
    defaultValue: {},
  });

  const ebarimtData: IDoc = await getPostData(
    models,
    config,
    deal,
    pipeline.paymentTypes
  );

  const ebarimtResponses: any[] = [];

  /*SKIP PUT DATA (manual Ebarimt)*/
  if (config.skipPutData) {
    const { status, msg, data, innerData } = await getEbarimtData({
      config,
      doc: ebarimtData,
    });

    if (status !== "ok" || (!data && !innerData)) {
      ebarimtResponses.push({
        _id: nanoid(),
        id: "Error",
        status: "ERROR",
        message: msg,
      });
    } else {
      const now = moment(new Date()).format("yyyy-MM-DD HH:mm:ss");

      if (data) {
        ebarimtResponses.push({
          _id: nanoid(),
          ...data,
          id: "Түр баримт",
          status: "SUCCESS",
          date: now,
          registerNo: config.companyRD || "",
        });
      }

      if (innerData) {
        ebarimtResponses.push({
          ...innerData,
          id: "Түр баримт",
          status: "SUCCESS",
          date: now,
          registerNo: config.companyRD || "",
        });
      }
    }
  } else {
    /*NORMAL PUT DATA (auto Ebarimt)*/
    try {
      const { putData, innerData } = await models.PutResponses.putData(
        ebarimtData,
        config,
        user
      );

      if (putData) ebarimtResponses.push(putData);
      if (innerData) ebarimtResponses.push(innerData);
    } catch (e) {
      ebarimtResponses.push({
        _id: nanoid(),
        id: "Error",
        status: "ERROR",
        message: e.message,
      });
    }
  }

  /* PUBLISH AUTOMATION RESPONS*/
  if (ebarimtResponses.length) {
    try {
      await graphqlPubsub.publish(`automationResponded:${user._id}`, {
        automationResponded: {
          userId: user._id,
          responseId: ebarimtResponses.map((r) => r._id).join("-"),
          sessionCode: user.sessionCode || "",
          content: ebarimtResponses.map((r) => ({
            ...config,
            ...r,
            description: config.withDescription ? deal.description || "" : "",
          })),
        },
      });
    } catch (e) {
      throw new Error(e.message);
    }
  }
};
