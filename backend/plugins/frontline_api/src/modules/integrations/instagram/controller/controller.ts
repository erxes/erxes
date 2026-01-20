import { getSubdomain } from "erxes-api-shared/utils";
import { generateModels } from "~/connectionResolvers";
import { getPageList } from "../utils";
import { getConfig } from "../commonUtils";
import receiveMessage from "./receiveMessage";
import receiveComment from "./receiveComment";
import {
  debugError,
  debugInstagram,
  debugRequest,
  debugResponse
} from "../debuggers";

export const instagramGetAccounts = async (req, res, next) => {
  debugRequest(debugInstagram, req);
  const accountId = req.query.accountId;
  const subdomain = getSubdomain(req);
  const models = await generateModels(subdomain);
  
  const account = await models.InstagramAccounts.getAccount({
    _id: req.query.accountId
  });

  const accessToken = account.token;

  let pages: any[] = [];

  try {
    pages = await getPageList(models, accessToken);
  } catch (e) {
    if (!e.message.includes("Application request limit reached")) {
      await models.InstagramIntegrations.updateOne(
        { accountId },
        {
          $set: {
            healthStatus: "account-token",
            error: `${e.message}`
          }
        }
      );
    }

    debugError(`Error occured while connecting to instagram ${e.message}`);
    return next(e);
  }

  debugResponse(debugInstagram, req, JSON.stringify(pages));

  return res.json(pages);
};

export const instagramSubscription = async (req, res) => {
  const subdomain = getSubdomain(req);
  const models = await generateModels(subdomain);

  const INSTAGRAM_VERIFY_TOKEN = await getConfig(
    models,
    "INSTAGRAM_VERIFY_TOKEN"
  );

  // when the endpoint is registered as a webhook, it must echo back
  // the 'hub.challenge' value it receives in the query arguments
  if (req.query["hub.mode"] === "subscribe") {
    if (req.query["hub.verify_token"] === INSTAGRAM_VERIFY_TOKEN) {
      res.send(req.query["hub.challenge"]);
    } else {
      res.send("OK");
    }
  } else {
    // Handle case where hub.mode is not subscribe (optional, depends on logic)
    res.send("OK");
  }
};

export const instagramWebhook = async (req, res) => {
  const subdomain = getSubdomain(req);
  const models = await generateModels(subdomain);
  const data = req.body;

  if (data.object !== "instagram") {
    return res.send("Invalid object");
  }

  for (const entry of data.entry) {
    // receive chat
    if (entry.messaging) {
      const messageData = entry.messaging[0];
      if (messageData) {
        try {
          await receiveMessage(models, subdomain, messageData);
          return res.send("success");
        } catch (e) {
          return res.send("error " + e);
        }
      }
    } else if (entry.standby) {
      // Handle standby data if entry.messaging does not exist
      const standbyData = entry.standby;
      if (standbyData && standbyData.length > 0) {
        try {
          // Process each item in standbyData
          for (const data of standbyData) {
            await receiveMessage(models, subdomain, data); // Pass the current item
          }
          return res.send("success");
        } catch (e) {
          return res.send("error " + e);
        }
      } else {
        return res.send("no standby data");
      }
    }
    
    if (entry.changes) {
      for (const event of entry.changes) {
        if (event.field === "comments") {
          debugInstagram(
            `Received comment data ${JSON.stringify(event.value)}`
          );
          try {
            await receiveComment(models, subdomain, event.value, entry.id);
            debugInstagram(
              `Successfully saved  ${JSON.stringify(event.value)}`
            );
            return res.end("success");
          } catch (e) {
            debugError(`Error processing comment: ${e.message}`);
            return res.end("success");
          }
        }
      }
    }
  }
  
  // Fallback if no conditions matched inside loop
  if (!res.headersSent) {
    res.send("success");
  }
};