import { moduleRequireLogin } from "@erxes/api-utils/src/permissions";

import {
  checkPremiumService,
  getCoreDomain,
  getEnv,
  readFile
} from "../../utils";

import { getService, getServices } from "@erxes/api-utils/src/serviceDiscovery";
import { sendCommonMessage } from "../../../messageBroker";
import { DEFAULT_CONSTANT_VALUES } from "@erxes/api-utils/src/constants";

import * as dotenv from "dotenv";
import { IContext } from "../../../connectionResolver";
import fetch from "node-fetch";
dotenv.config();

const configQueries = {
  /**
   * Config object
   */
  async configs(_root, _args, { models }: IContext) {
    return models.Configs.find({});
  },

  async configsByCode(_root, { codes, pattern }: { codes: string[], pattern: string }, { models }: IContext) {

    const query: any = {
      $or: []
    };

    if (codes?.length) {
      query.$or.push({ code: { $in: codes } });
    }
  
    if (pattern) {
      query.$or.push({ code: { $regex: pattern, $options: 'i' } });
    }

    return models.Configs.find(query);
  },

  async configsGetVersion(_root, { releaseNotes }) {
    const result = {
      version: "-",
      isUsingRedis: Boolean(process.env.REDIS_HOST),
      isUsingRabbitMQ: Boolean(process.env.RABBITMQ_HOST),
      isUsingElkSyncer: Boolean(process.env.ELK_SYNCER !== "false"),
      isLatest: false,
      releaseInfo: {}
    };

    const erxesDomain = getEnv({ name: "DOMAIN" });

    const erxesVersion = await fetch(`${erxesDomain}/version.json`).then(r =>
      r.json()
    );

    result.version = erxesVersion.packageVersion || "-";

    const response = await fetch(
      `${process.env.CORE_URL || "https://erxes.io"}/git-release-info`
    ).then(r => r.json());

    result.isLatest = result.version === response.tag_name;

    if (releaseNotes) {
      result.releaseInfo = response;
    }

    return result;
  },

  async configsGetEnv(_root) {
    return {
      USE_BRAND_RESTRICTIONS: process.env.USE_BRAND_RESTRICTIONS,
      RELEASE: process.env.RELEASE
    };
  },

  async configsConstants(_root, _args, { models }: IContext) {
    return {
      allValues: models.Configs.constants(),
      defaultValues: DEFAULT_CONSTANT_VALUES
    };
  },

  async configsCheckPremiumService(_root, args: { type: string }) {
    return checkPremiumService(args.type);
  },

  async configsCheckActivateInstallation(_root, args: { hostname: string }) {
    try {
      return await fetch(`${getCoreDomain()}/check-activate-installation`, {
        method: "POST",
        body: JSON.stringify(args),
        headers: { "Content-Type": "application/json" }
      }).then(r => r.json());
    } catch (e) {
      throw new Error(e.message);
    }
  },

  async configsGetEmailTemplate(_root, { name }: { name?: string }) {
    return readFile(name || "base");
  },

  async search(_root, { value }: { value: string }, { subdomain }: IContext) {
    const services = await getServices();

    let results: Array<{ module: string; items: any[] }> = [];

    for (const serviceName of services) {
      const service = await getService(serviceName);
      const meta = service.config ? service.config.meta : {};

      if (meta && meta.isSearchable) {
        const serviceResults = await sendCommonMessage({
          subdomain,
          serviceName,
          action: "search",
          data: {
            subdomain,
            value
          },
          isRPC: true
        });

        results = [...results, ...serviceResults];
      }
    }

    return results;
  },

  async configsGetValue(
    _root,
    { code }: { code: string },
    { models }: IContext
  ) {
    return models.Configs.findOne({ code });
  },

  async configsGetInstallationStatus(
    _root,
    { name }: { name: string },
    { models }: IContext
  ) {
    const names = await getServices();

    if (names.includes(name)) {
      return { status: "installed" };
    }

    const isExisting = await models.InstallationLogs.findOne({
      pluginName: name
    });

    if (!isExisting) {
      return { status: "notExisting" };
    }

    const isDone = await models.InstallationLogs.findOne({
      pluginName: name,
      message: "done"
    });

    if (isDone) {
      return { status: "installed" };
    }

    const lastLog = await models.InstallationLogs.findOne({
      pluginName: name
    }).sort({ date: -1 });

    return { status: "installing", lastLogMessage: lastLog?.message };
  }
};

moduleRequireLogin(configQueries);

// @ts-ignore
configQueries.enabledServices = async () => {
  const names = await getServices();
  const result = {};

  for (const name of names) {
    result[name] = true;
  }

  return result;
};

export default configQueries;
