import * as dotenv from "dotenv";

// load environment variables
dotenv.config();

import * as cookieParser from "cookie-parser";
import * as cors from "cors";
import * as telemetry from "erxes-telemetry";
import * as express from "express";
import * as helmet from "helmet";
import { createServer } from "http";
import * as mongoose from "mongoose";
import * as path from "path";
import { initApolloServer } from "./apolloClient";
import { templateExport } from "./data/modules/fileExporter/templateExport";
import { buildChartFile } from "./data/modules/insight/export";

import * as fs from "fs";

import {
  deleteFile,
  getEnv,
  handleUnsubscription,
  readFileRequest,
  registerOnboardHistory,
  routeErrorHandling,
  uploadsFolderPath
} from "./data/utils";

import { debugBase, debugError, debugInit } from "./debuggers";
import { initBroker, sendCommonMessage } from "./messageBroker";
import { uploader } from "./middlewares/fileMiddleware";
import {
  getService,
  getServices,
  isEnabled,
  join,
  leave
} from "@erxes/api-utils/src/serviceDiscovery";
import logs from "./logUtils";

import init from "./startup";
import forms from "./forms";
import { generateModels } from "./connectionResolver";
import { authCookieOptions, getSubdomain } from "@erxes/api-utils/src/core";
import segments from "./segments";
import automations from "./automations";
import templates from "./templates";
import imports from "./imports";
import exporter from "./exporter";
import { moduleObjects } from "./data/permissions/actions/permission";
import { getEnabledServices } from "@erxes/api-utils/src/serviceDiscovery";
import { applyInspectorEndpoints } from "@erxes/api-utils/src/inspect";
import { handleCoreLogin, handleMagiclink, ssocallback } from "./saas";
import app from "@erxes/api-utils/src/app";
import sanitizeFilename from "@erxes/api-utils/src/sanitize-filename";
import search from "./search";
import tags from "./tags";
import {
  updateContactsValidationStatus,
  updateContactValidationStatus
} from "./data/modules/coc/verifierUtils";
import { buildFile } from "./exporterByUrl";
import reports from "./reports/reports";
import { getOrganizationDetail } from "@erxes/api-utils/src/saas/saas";

const {
  JWT_TOKEN_SECRET,
  WIDGETS_DOMAIN,
  DOMAIN,
  CLIENT_PORTAL_DOMAINS,
  VERSION
} = process.env;

if (!JWT_TOKEN_SECRET) {
  throw new Error("Please configure JWT_TOKEN_SECRET environment variable.");
}

// don't move it above telnyx controllers
app.use(express.urlencoded({ limit: "15mb", extended: true }));

app.use(
  express.json({
    limit: "15mb"
  })
);

app.use(cookieParser());

const corsOptions = {
  credentials: true,
  origin: [
    DOMAIN ? DOMAIN : "http://localhost:3000",
    WIDGETS_DOMAIN ? WIDGETS_DOMAIN : "http://localhost:3200",
    ...(CLIENT_PORTAL_DOMAINS || "").split(","),
    ...(process.env.ALLOWED_ORIGINS || "").split(",").map(c => c && RegExp(c))
  ]
};

app.use(cors(corsOptions));

app.use(helmet({ frameguard: { action: "sameorigin" } }));

app.get(
  "/initial-setup",
  routeErrorHandling(async (req: any, res) => {
    console.log("initial setup");
    const subdomain = getSubdomain(req);
    const models = await generateModels(subdomain);

    const userCount = await models.Users.countDocuments();

    if (userCount === 0) {
      return res.send("no owner");
    }

    await models.FieldsGroups.createSystemGroupsFields();

    if (req.query && req.query.update) {
      const services = await getServices();

      for (const serviceName of services) {
        const service = await getService(serviceName);
        const meta = service.config?.meta || {};

        if (meta && meta.initialSetup && meta.initialSetup.generateAvailable) {
          await sendCommonMessage({
            subdomain,
            action: "initialSetup",
            serviceName,
            data: {}
          });
        }
      }
    }

    const envMaps = JSON.parse(req.query.envs || "{}");

    for (const key of Object.keys(envMaps)) {
      res.cookie(key, envMaps[key], authCookieOptions({ secure: req.secure }));
    }

    const configs = await models.Configs.find({
      code: new RegExp(`.*THEME_.*`, "i")
    }).lean();

    await models.FieldsGroups.createSystemGroupsFields();

    return res.json(configs);
  })
);

app.get(
  "/v3/initial-setup",
  routeErrorHandling(async (req: any, res) => {
    console.log("initial setup");
    const subdomain = getSubdomain(req);
    const models = await generateModels(subdomain);

    const VERSION = getEnv({ name: "VERSION" });

    let organizationInfo;

    if (VERSION === "saas") {
      organizationInfo = await getOrganizationDetail({ subdomain, models });
    } else {
      organizationInfo = {
        type: "os",
        config: {}
      };
    }

    const userCount = await models.Users.countDocuments();

    if (userCount === 0) {
      organizationInfo.hasOwner = false;

      res.json(organizationInfo);
    } else {
      organizationInfo.hasOwner = true;
    }

    await models.FieldsGroups.createSystemGroupsFields();

    if (req.query && req.query.update) {
      const services = await getServices();

      for (const serviceName of services) {
        const service = await getService(serviceName);
        const meta = service.config?.meta || {};

        if (meta && meta.initialSetup && meta.initialSetup.generateAvailable) {
          await sendCommonMessage({
            subdomain,
            action: "initialSetup",
            serviceName,
            data: {}
          });
        }
      }
    }

    const envMaps = JSON.parse(req.query.envs || "{}");

    for (const key of Object.keys(envMaps)) {
      res.cookie(key, envMaps[key], authCookieOptions({ secure: req.secure }));
    }

    const configs = await models.Configs.find({
      code: new RegExp(`.*THEME_.*`, "i")
    }).lean();

    await models.FieldsGroups.createSystemGroupsFields();

    organizationInfo.configs = configs;

    return res.json(organizationInfo);
  })
);

// app.post('/webhooks/:id', webhookMiddleware);

app.use("/static", express.static(path.join(__dirname, "private")));

app.get(
  "/chart-table-export",
  routeErrorHandling(async (req: any, res) => {
    const { query } = req;

    const subdomain = getSubdomain(req);

    const result = await buildChartFile(subdomain, query);

    res.attachment(`${result.name}.xlsx`);

    return res.send(result.response);
  })
);

app.get(
  "/download-template",
  routeErrorHandling(async (req: any, res) => {
    const name = req.query.name;

    const subdomain = getSubdomain(req);
    const models = await generateModels(subdomain);

    registerOnboardHistory({ models, type: `${name}Download`, user: req.user });

    return res.redirect(
      `https://erxes-docs.s3-us-west-2.amazonaws.com/templates/${name}`
    );
  })
);

app.get(
  "/template-export",
  routeErrorHandling(async (req: any, res) => {
    const { importType } = req.query;

    const subdomain = getSubdomain(req);
    const models = await generateModels(subdomain);

    registerOnboardHistory({
      models,
      type: `importDownloadTemplate`,
      user: req.user
    });

    const { name, response } = await templateExport(req.query);

    res.attachment(`${name}.${importType}`);
    return res.send(response);
  })
);

// read file
app.get("/read-file", async (req: any, res, next) => {
  const subdomain = getSubdomain(req);
  const models = await generateModels(subdomain);

  try {
    const { key, inline, name, width } = req.query;

    if (!key) {
      return res.send("Invalid key");
    }

    const response = await readFileRequest({
      key,
      subdomain,
      models,
      userId: req.headers.userid,
      width
    });

    if (inline && inline === "true") {
      const extension = key.split(".").pop();
      res.setHeader("Content-disposition", 'inline; filename="' + key + '"');
      res.setHeader("Content-type", `application/${extension}`);

      return res.send(response);
    }

    res.attachment(name || key);

    return res.send(response);
  } catch (e) {
    if ((e as Error).message.includes("key does not exist")) {
      return res.status(404).send("Not found");
    }

    debugError(e);

    return next(e);
  }
});

app.get(
  "/file-export",
  routeErrorHandling(async (req: any, res) => {
    const { query } = req;
    const { segment } = query;
    const subdomain = getSubdomain(req);
    const models = await generateModels(subdomain);

    const result = await buildFile(models, subdomain, query);

    res.attachment(`${result.name}.xlsx`);

    if (segment) {
      try {
        models.Segments.removeSegment(segment);
      } catch (e) {
        console.log((e as Error).message);
      }
    }

    return res.send(result.response);
  })
);

app.post(
  `/verifier/webhook`,
  routeErrorHandling(async (req, res) => {
    const { emails, phones, email, phone } = req.body;
    const subdomain = getSubdomain(req);
    const models = await generateModels(subdomain);

    if (email) {
      await updateContactValidationStatus(models, email);
    } else if (emails) {
      await updateContactsValidationStatus(models, "email", emails);
    } else if (phone) {
      await updateContactValidationStatus(models, phone);
    } else if (phones) {
      await updateContactsValidationStatus(models, "phone", phones);
    }

    return res.send("success");
  })
);

app.get("/verify", async (req, res) => {
  const { p } = req.query;

  const data = JSON.parse(Buffer.from(p as string, "base64").toString("utf8"));

  const { email, customerId } = data;

  const subdomain = getSubdomain(req);
  const models = await generateModels(subdomain);

  const customer = await models.Customers.findOne({ _id: customerId });

  if (!customer) {
    return res.send("Can not find customer");
  }

  if (customer.primaryEmail !== email) {
    return res.send("Customer email does not match");
  }

  if (customer.emails?.findIndex(e => e === email) === -1) {
    return res.send("Customer email does not match");
  }

  await models.Customers.updateOne(
    { _id: customerId },
    { $set: { primaryEmail: email, emailValidationStatus: "valid" } }
  );

  return res.send("Successfully verified, you can close this tab now");
});

// delete file
app.post(
  "/delete-file",
  routeErrorHandling(async (req: any, res) => {
    // require login
    if (!req.headers.userid) {
      return res.end("forbidden");
    }

    const subdomain = getSubdomain(req);
    const models = await generateModels(subdomain);

    const status = await deleteFile(models, req.body.fileName);

    if (status === "ok") {
      return res.send(status);
    }

    return res.status(500).send(status);
  })
);

// unsubscribe
app.get(
  "/unsubscribe",
  routeErrorHandling(async (req: any, res) => {
    const subdomain = getSubdomain(req);
    const models = await generateModels(subdomain);

    await handleUnsubscription(models, subdomain, req.query);

    res.setHeader("Content-Type", "text/html; charset=utf-8");

    const template = fs.readFileSync(
      __dirname + "/private/emailTemplates/unsubscribe.html"
    );

    return res.send(template);
  })
);

app.post("/upload-file", uploader);

app.post("/upload-file&responseType=json", uploader);

app.get("/ml-callback", (req: any, res) => handleMagiclink(req, res));
app.get("/core-login", (req: any, res) => handleCoreLogin(req, res));
app.get("/sso-callback", ssocallback);

// Error handling middleware
app.use((error, _req, res, _next) => {
  debugError(error.message);
  res.status(500).send(error.message);
});

app.get("/get-import-file/:fileName", async (req, res) => {
  const fileName = req.params.fileName;

  const sanitizeFileName = sanitizeFilename(fileName);

  const filePath = path.join(uploadsFolderPath, sanitizeFileName);

  res.sendFile(filePath);
});

app.get("/plugins/enabled/:name", async (req, res) => {
  const result = await isEnabled(req.params.name);
  res.json(result);
});

app.get("/plugins/enabled", async (_req, res) => {
  const result = (await getEnabledServices()) || [];
  res.json(result);
});

applyInspectorEndpoints("core");

// Wrap the Express server
const httpServer = createServer(app);

const PORT = getEnv({ name: "PORT" });
const MONGO_URL = getEnv({ name: "MONGO_URL" });

httpServer.listen(PORT, async () => {
  await initApolloServer(app, httpServer);

  await initBroker();

  init()
    .then(() => {
      telemetry.trackCli("server_started");
      telemetry.startBackgroundUpdate();

      debugBase("Startup successfully started");
    })
    .catch(e => {
      debugError(`Error occured while starting init: ${e.message}`);
    });

  await join({
    name: "core",
    port: PORT,
    hasSubscriptions: false,
    meta: {
      isSearchable: true,
      logs: { providesActivityLog: true, consumers: logs },
      forms,
      segments,
      automations,
      templates,
      search,
      permissions: moduleObjects,
      tags,
      imports,
      exporter,
      cronjobs: {
        handle10MinutelyJobAvailable: VERSION === "saas" ? true : false
      },
      reports
    }
  });

  debugInit(`GraphQL Server is now running on ${PORT}`);
});

// GRACEFULL SHUTDOWN
process.stdin.resume(); // so the program will not close instantly

async function closeMongooose() {
  try {
    await mongoose.connection.close();
    console.log("Mongoose connection disconnected ");
  } catch (e) {
    console.error(e);
  }
}

async function leaveServiceDiscovery() {
  try {
    await leave("core", PORT);
    console.log("Left from service discovery");
  } catch (e) {
    console.error(e);
  }
}

async function closeHttpServer() {
  try {
    await new Promise<void>((resolve, reject) => {
      // Stops the server from accepting new connections and finishes existing connections.
      httpServer.close((error: Error | undefined) => {
        if (error) {
          return reject(error);
        }
        resolve();
      });
    });
  } catch (e) {
    console.error(e);
  }
}

// If the Node process ends, close the http-server and mongoose.connection and leave service discovery.
(["SIGINT", "SIGTERM"] as NodeJS.Signals[]).forEach(sig => {
  process.on(sig, async () => {
    await closeHttpServer();
    await closeMongooose();
    await leaveServiceDiscovery();
    process.exit(0);
  });
});
