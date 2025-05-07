import { getSubdomain } from "@erxes/api-utils/src/core";
import { debugError, debugFacebook } from "./debuggers";
import { getConfig } from "./commonUtils";
import loginMiddleware from "./middlewares/loginMiddleware";
import receiveComment from "./receiveComment";
import receiveMessage from "./receiveMessage";
import receivePost from "./receivePost";
import { FACEBOOK_POST_TYPES, INTEGRATION_KINDS } from "./constants";
import {
  checkIsAdsOpenThread,
  getAdapter,
  getPageAccessTokenFromMap
} from "./utils";
import { generateModels, IModels } from "./connectionResolver";
import { IIntegrationDocument } from "./models/Integrations";
import { NextFunction, Request, Response } from "express";
const init = async (app) => {
  app.get("/fblogin", loginMiddleware);

  app.get("/facebook/get-post", async (req, res) => {
    debugFacebook(
      `Request to get post data with: ${JSON.stringify(req.query)}`
    );

    const subdomain = getSubdomain(req);
    const models = await generateModels(subdomain);

    const { erxesApiId } = req.query;

    const post = await models.PostConversations.findOne({ erxesApiId });

    return res.json({ ...post });
  });

  app.get("/facebook/get-status", async (req, res) => {
    const subdomain = getSubdomain(req);
    const models = await generateModels(subdomain);

    const { integrationId } = req.query;

    const integration = await models.Integrations.findOne({
      erxesApiId: integrationId
    });

    let result = {
      status: "healthy"
    } as any;

    if (integration) {
      result = {
        status: integration.healthStatus || "healthy",
        error: integration.error
      };
    }

    return res.send(result);
  });

  const accessTokensByPageId = {};

  // Facebook endpoint verifier
  app.get("/facebook/receive", async (req, res) => {
    const subdomain = getSubdomain(req);
    const models = await generateModels(subdomain);

    const FACEBOOK_VERIFY_TOKEN = await getConfig(
      models,
      "FACEBOOK_VERIFY_TOKEN"
    );

    // when the endpoint is registered as a webhook, it must echo back
    // the 'hub.challenge' value it receives in the query arguments
    if (req.query["hub.mode"] === "subscribe") {
      if (req.query["hub.verify_token"] === FACEBOOK_VERIFY_TOKEN) {
        res.send(req.query["hub.challenge"]);
      } else {
        res.send("OK");
      }
    }
  });

  app.post("/facebook/receive", async (req, res, next) => {
    const subdomain = getSubdomain(req);
    const models = await generateModels(subdomain);

    const data = req.body;

    if (data.object !== "page" && !checkIsAdsOpenThread(data?.entry)) {
      return;
    }
    const adapter = await getAdapter(models);
    for (const entry of data.entry) {
      // receive chat

      try {
        if (entry.messaging) {
          await processMessagingEvent(
            entry,
            models,
            req,
            res,
            next,
            adapter,
            subdomain,
            accessTokensByPageId
          );
        }
        if (entry.standby) {
          const activities = await processStandbyEvents(entry, models);
          for (const { activity, integration } of activities) {
            await receiveMessage(models, subdomain, integration, activity);
          }
        }
      } catch (error) {
        debugFacebook(`Error processing entry: ${error.message}`);
        // Optionally, send a response or log the error
        res.status(500).send("Internal Server Error");
      }

      // receive post and comment
      if (entry.changes) {
        for (const event of entry.changes) {
          if (event.value.item === "comment") {
            debugFacebook(
              `Received comment data ${JSON.stringify(event.value)}`
            );
            try {
              await receiveComment(models, subdomain, event.value, entry.id);
              debugFacebook(
                `Successfully saved  ${JSON.stringify(event.value)}`
              );
              return res.end("success");
            } catch (e) {
              debugError(`Error processing comment: ${e.message}`);
              return res.end("success");
            }
          }

          if (FACEBOOK_POST_TYPES.includes(event.value.item)) {
            try {
              debugFacebook(
                `Received post data ${JSON.stringify(event.value)}`
              );
              await receivePost(models, subdomain, event.value, entry.id);
              debugFacebook(
                `Successfully saved post ${JSON.stringify(event.value)}`
              );
              return res.end("success");
            } catch (e) {
              debugError(`Error processing post: ${e.message}`);
              return res.end("success");
            }
          } else {
            return res.end("success");
          }
        }
      }
    }
  });
};

export default init;
export async function processStandbyEvents(data: any, models: IModels) {
  const activities: {
    activity: any;
    integration: IIntegrationDocument;
  }[] = [];
  if (!data.standby || !Array.isArray(data.standby)) {
    debugFacebook("No standby events found or standby is not an array");
    return activities;
  }
  for (const standbyEvent of data.standby) {
    try {
      if (
        !standbyEvent.recipient?.id ||
        !standbyEvent.sender?.id ||
        !standbyEvent.timestamp
      ) {
        debugFacebook("Invalid standby event: missing required fields");
        continue; // Skip invalid event
      }

      const integration = await models.Integrations.getIntegration({
        $and: [
          { facebookPageIds: { $in: [standbyEvent.recipient.id] } },
          { kind: INTEGRATION_KINDS.MESSENGER }
        ]
      });

      if (!integration) {
        debugFacebook(
          `Integration not found for pageId: ${standbyEvent.recipient.id}`
        );
        continue;
      }

      const activity: any = {
        channelId: "facebook",
        timestamp: new Date(standbyEvent.timestamp),
        conversation: {
          id: standbyEvent.sender.id
        },
        from: {
          id: standbyEvent.sender.id,
          name: standbyEvent.sender.id
        },
        recipient: {
          id: standbyEvent.recipient.id,
          name: standbyEvent.recipient.id
        },
        channelData: standbyEvent,
        type: "message",
        text: standbyEvent.message?.text || ""
      };

      activities.push({ activity, integration });
    } catch (error) {
      debugFacebook(`Error processing standby event: ${error.message}`);
    }
  }

  return activities;
}

const processMessagingEvent = async (
  entry: any,
  models: IModels,
  req: Request,
  res: Response,
  next: NextFunction,
  adapter: any,
  subdomain: string,
  accessTokensByPageId: Record<string, string>
) => {
  debugFacebook(`Received messenger data ${JSON.stringify(entry)}`);

  try {
    await adapter.processActivity(req, res, async (context: any) => {
      const { activity } = await context;

      if (!activity || !activity.recipient) {
        return next();
      }

      const pageId = activity.recipient.id;

      // Find integration for the page
      const integration = await models.Integrations.getIntegration({
        $and: [
          { facebookPageIds: { $in: [pageId] } },
          { kind: INTEGRATION_KINDS.MESSENGER }
        ]
      });

      if (!integration) {
        throw new Error("Integration not found");
      }

      // Verify the account associated with the integration
      await models.Accounts.getAccount({ _id: integration.accountId });

      // Get the page access token
      const { facebookPageTokensMap = {} } = integration;
      try {
        accessTokensByPageId[pageId] = getPageAccessTokenFromMap(
          pageId,
          facebookPageTokensMap
        );
      } catch (e) {
        debugFacebook(
          `Error occurred while getting page access token: ${e.message}`
        );
        return next();
      }

      // Process the received message
      await receiveMessage(models, subdomain, integration, activity);

      debugFacebook(`Successfully saved activity ${JSON.stringify(activity)}`);
    });
  } catch (e) {
    debugFacebook(
      `Error occurred while processing messaging activity: ${e.message}`
    );
    return res.end("success");
  }
};
