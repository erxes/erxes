import { getSubdomain } from "@erxes/api-utils/src/core";
import { getConfig } from "./commonUtils";
import loginMiddleware from "./middlewares/loginMiddleware";
import receiveMessage from "./receiveMessage";
import { generateModels } from "./connectionResolver";
import { getBusinessWhatsAppDetails } from "./utils";
import { INTEGRATION_KINDS } from "./constants";

import {
  debugError,
  debugWhatsapp,
  debugRequest,
  debugResponse
} from "./debuggers";

const init = async (app) => {
  app.get("/login", loginMiddleware);

  app.get("/whatsapp/receive", async (req, res) => {
    const subdomain = getSubdomain(req);
    const models = await generateModels(subdomain);

    const WHATSAPP_VERIFY_TOKEN = await getConfig(
      models,
      "WHATSAPP_VERIFY_TOKEN"
    );

    if (req.query["hub.mode"] === "subscribe") {
      if (req.query["hub.verify_token"] === WHATSAPP_VERIFY_TOKEN) {
        res.send(req.query["hub.challenge"]);
      } else {
        res.send("OK");
      }
    }
  });
  app.post("/whatsapp/receive", async (req, res, next) => {
    const subdomain = getSubdomain(req);
    const models = await generateModels(subdomain);
    const data = req.body;
    if (data.object !== "whatsapp_business_account") {
      return res.status(400).end();
    }

    try {
      for (const entry of data.entry) {
        if (entry.changes) {
          for (const event of entry.changes) {
            if (event.field === "messages") {
              debugWhatsapp(
                `Received message data ${JSON.stringify(event.value)}`
              );
              await receiveMessage(models, subdomain, event.value);
              debugWhatsapp(
                `Successfully saved ${JSON.stringify(event.value)}`
              );
            }
          }
        }
      }
      return res.end("success");
    } catch (error) {
      debugError(`Error processing message: ${error.message}`);
      return res.end("error");
    }
  });
};

export default init;
