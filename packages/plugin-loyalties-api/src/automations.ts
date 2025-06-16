import { getService } from "@erxes/api-utils/src/serviceDiscovery";
import * as dayjs from "dayjs";
import { generateModels, IModels } from "./connectionResolver";
import {
  sendClientPortalMessage,
  sendCommonMessage,
  sendCoreMessage,
} from "./messageBroker";

export default {
  constants: {
    triggers: [
      {
        type: "loyalties:reward",
        img: "automation3.svg",
        icon: "gift",
        label: "Reward",
        description:
          "Start with a blank workflow that enrolls and is triggered off reward",
        isCustom: true,
      },
    ],
    actions: [
      {
        type: "loyalties:voucher.create",
        icon: "file-plus",
        label: "Create voucher",
        description: "Create voucher",
        isAvailable: true,
      },
      {
        type: "loyalties:score.create",
        icon: "file-plus",
        label: "Change Score",
        description: "Change Score",
        isAvailable: true,
      },
      {
        type: "loyalties:spin.create",
        icon: "file-plus",
        label: "Create Spin",
        description: "Create Spin",
        isAvailable: true,
      },
    ],
  },
  receiveActions: async ({
    subdomain,
    data: { action, execution, actionType },
  }) => {
    const models = await generateModels(subdomain);

    if (actionType === "create") {
      return actionCreate({ subdomain, action, execution });
    }

    return;
  },
  checkCustomTrigger: async ({ subdomain, data }) => {
    const { collectionType, config } = data;

    const { rewardType } = config;

    if (collectionType === "reward") {
      switch (rewardType) {
        case "birthday":
          return await checkBirthDateTrigger(subdomain, data);
        default:
          return false;
      }
    }

    return false;
  },
};

const checkBirthDateTrigger = async (subdomain, data) => {
  const { target, config } = data || {};

  const NOW = new Date();
  const NOW_MONTH = NOW.getMonth();

  const { appliesTo = [] } = config || {};

  if (!appliesTo?.length) return false;

  if (target?.details?.birthDate) {
    if (new Date(target?.details?.birthDate).getMonth() !== NOW_MONTH) {
      return false;
    }

    return appliesTo.includes("user");
  }

  if (target?.birthDate) {
    if (new Date(target?.birthDate).getMonth() !== NOW_MONTH) {
      return false;
    }

    return appliesTo.includes("customer");
  }

  if (!target?.details?.birthDate && !target?.birthDate) {
    return false;
  }

  const startOfYear = dayjs().startOf("year");
  const endOfYear = dayjs().add(1, "year").startOf("year");

  const executions = await sendCommonMessage({
    subdomain,
    serviceName: "automations",
    action: "executions.find",
    data: {
      triggerType: "loyalties:reward",
      "triggerConfig.rewardType": "birthday",
      targetId: target._id,
      status: "complete",
      createdAt: {
        $gte: startOfYear,
        $lt: endOfYear,
      },
    },
    isRPC: true,
    defaultValue: [],
  });

  return executions?.length === 0;
};

const generateAttributes = (value) => {
  const matches = (value || "").match(/\{\{\s*([^}]+)\s*\}\}/g);
  return matches.map((match) => match.replace(/\{\{\s*|\s*\}\}/g, ""));
};

const generateIds = async (value) => {
  if (
    Array.isArray(value) &&
    (value || []).every((value) => typeof value === "string")
  ) {
    return [...new Set(value)];
  }

  if (typeof value === "string" && value.includes(", ")) {
    return [...new Set(value.split(", "))];
  }

  if (typeof value === "string") {
    return [value];
  }

  return [];
};

const getOwner = async ({
  models,
  subdomain,
  execution,
  contentType,
  config,
}: {
  models: IModels;
  subdomain: string;
  execution: any;
  contentType: string;
  config: any;
}) => {
  let ownerType;
  let ownerId;

  if (
    ["core:customer", "core:user", "core:company"].includes(
      execution.triggerType
    )
  ) {
    ownerType = contentType;
    ownerId = execution.targetId;
  }

  if (
    ["inbox:conversation", "pos:posOrder"].some((type) =>
      execution.triggerType.includes(type)
    )
  ) {
    ownerType = "customer";
    ownerId = execution.target.customerId;
  }

  if (
    ["tasks:task", "sales:deal", "tickets:ticket", "purchases:purchase"].some(
      (type) =>
        execution.triggerType === type || execution.triggerType.startsWith(type)
    )
  ) {
    const customerIds = await sendCoreMessage({
      subdomain,
      action: "conformities.savedConformity",
      data: {
        mainType: contentType,
        mainTypeId: execution.targetId,
        relTypes: ["customer"],
      },
      isRPC: true,
      defaultValue: [],
    });

    if (customerIds.length) {
      const customers = await sendCoreMessage({
        subdomain,
        action: "customers.find",
        data: {
          _id: { $in: customerIds },
        },
        isRPC: true,
        defaultValue: [],
      });

      if (customers.length) {
        ownerType = "customer";
        ownerId = customers[0]._id;
      }
    }
  }

  if (["loyalties:reward"].includes(execution.triggerType)) {
    const { targetId, target = {} } = execution || {};

    if (
      "state" in target ||
      "relatedIntegrationIds" in target ||
      "integrationId" in target
    ) {
      ownerType = "customer";
    }

    if ("details" in target || "role" in target) {
      ownerType = "user";
    }

    if ("plan" in target || "industry" in target) {
      ownerType = "company";
    }

    ownerId = targetId;
  }

  return { ownerType, ownerId };
};

const createVoucher = async ({
  models,
  subdomain,
  execution,
  contentType,
  config,
}: {
  models: IModels;
  subdomain: string;
  execution: any;
  contentType: string;
  config: any;
}) => {
  let voucherConfig;

  let { ownerId, ownerType } = await getOwner({
    models,
    subdomain,
    execution,
    contentType,
    config,
  });

  if (ownerType === "customer") {
    const customerRelatedClientPortalUser = await sendClientPortalMessage({
      subdomain,
      action: "clientPortalUsers.findOne",
      data: {
        erxesCustomerId: ownerId,
      },
      isRPC: true,
      defaultValue: null,
    });

    if (customerRelatedClientPortalUser) {
      ownerId = customerRelatedClientPortalUser._id;
      ownerType = "cpUser";
    }
  }

  if (["loyalties:reward"].includes(execution.triggerType)) {
    const { customRule } = config || {};

    if (customRule) {
      const { duration = "month" } = customRule || {};

      const endDate = new Date();

      switch (duration) {
        case "month":
          endDate.setMonth(endDate.getMonth() + 1);
          break;
        case "week":
          endDate.setDate(endDate.getDate() + 7);
          break;
        case "day":
          endDate.setDate(endDate.getDate() + 1);
          break;
        case "minute":
          endDate.setMinutes(endDate.getMinutes() + 2);
        default:
          break;
      }

      voucherConfig = {
        endDate,
      };
    }
  }

  return await models.Vouchers.createVoucher({
    campaignId: config?.voucherCampaignId || undefined,
    ownerType,
    ownerId,
    config: voucherConfig,
  });
};

const replaceContent = async ({ serviceName, subdomain, data }) => {
  const replacedContent = await sendCommonMessage({
    serviceName,
    subdomain,
    action: "automations.replacePlaceHolders",
    data,
    isRPC: true,
    defaultValue: {},
  });

  return replacedContent?.scoreString || 0;
};

const evalPlaceHolder = (placeholder) => {
  if (placeholder.match(/[+\-*/]/)) {
    try {
      return eval(placeholder);
    } catch (error) {
      throw new Error(`Error occurred while calculating score ${placeholder}`);
    }
  }
  return 0;
};

const generateScore = async ({
  models,
  serviceName,
  subdomain,
  target,
  config,
}: {
  models: IModels;
  subdomain: string;
  serviceName: string;
  target: any;
  config: any;
}) => {
  let { campaignId, action, scoreString } = (config || {}) as {
    scoreString: string;
    campaignId: string;
    action: "add" | "subtract";
  };
  if (!scoreString && !campaignId) {
    throw new Error("Please provide score config");
  }

  if (campaignId) {
    if (!["add", "subtract"].includes(action)) {
      throw new Error("Please select action that add or subtract");
    }

    const scoreCampaign = await models.ScoreCampaigns.findOne({
      _id: campaignId,
    });

    if (!scoreCampaign) {
      throw new Error("Not found score campaign");
    }

    const actionConfig = scoreCampaign[action];

    const placeholder = await replaceContent({
      serviceName,
      subdomain,
      data: {
        target,
        config: {
          scoreString: actionConfig.placeholder,
        },
      },
    });

    const score = evalPlaceHolder(placeholder);

    return Number(score) / Number(actionConfig.currencyRatio);
  }

  if (scoreString.match(/\{\{\s*([^}]+)\s*\}\}/g)) {
    scoreString = await replaceContent({
      serviceName,
      subdomain,
      data: {
        target,
        config: {
          scoreString,
        },
      },
    });
  }

  if (scoreString.match(/[+\-*/]/)) {
    try {
      return eval(scoreString);
    } catch (error) {
      throw new Error(`Error occurred while calculating score ${scoreString}`);
    }
  }
  return scoreString;
};

const addScore = async ({
  models,
  subdomain,
  execution,
  serviceName,
  contentType,
  config,
}: {
  models: IModels;
  subdomain: string;
  execution: any;
  serviceName: string;
  contentType: string;
  config: any;
}) => {
  if (config?.campaignId) {
    return await docScoreCampaign({
      models,
      subdomain,
      contentType,
      execution,
      config,
    });
  }

  const score = await generateScore({
    serviceName,
    models,
    subdomain,
    target: execution.target,
    config,
  });

  if (!!config?.ownerType && !!config?.ownerIds?.length) {
    return await models.ScoreLogs.changeOwnersScore({
      ownerType: config.ownerType,
      ownerIds: config.ownerIds,
      changeScore: score,
      description: "from automation",
    });
  }

  if (config?.attribution) {
    let attributes = generateAttributes(config?.attribution || "");

    if (attributes.includes("triggerExecutor")) {
      const { ownerType, ownerId } = await getOwner({
        models,
        subdomain,
        execution,
        contentType,
        config,
      });

      await models.ScoreLogs.changeOwnersScore({
        ownerType,
        ownerIds: [ownerId],
        changeScore: score,
        description: "from automation",
      });
      attributes = attributes.filter(
        (attribute) => attribute !== "triggerExecutor"
      );
    }

    if (!attributes?.length) {
      return "done";
    }
    const data = {
      target: {
        ...execution?.target,
        customers: null,
        companies: null,
        type: contentType.includes(".")
          ? contentType.split(".")[0]
          : contentType,
      },
      config: {},
      relatedValueProps: {},
    };

    for (const attribute of attributes) {
      data.config[attribute] = `{{ ${attribute} }}`;
      data.relatedValueProps[attribute] = {
        key: "_id",
      };
    }

    const replacedContent = await sendCommonMessage({
      subdomain,
      serviceName,
      action: "automations.replacePlaceHolders",
      data,
      isRPC: true,
      defaultValue: {},
    });

    if (replacedContent["customers"]) {
      await models.ScoreLogs.changeOwnersScore({
        ownerType: "customer",
        ownerIds: await generateIds(replacedContent["customers"]),
        changeScore: score,
        description: "from automation",
      });
    }

    if (replacedContent["companies"]) {
      await models.ScoreLogs.changeOwnersScore({
        ownerType: "company",
        ownerIds: await generateIds(replacedContent["companies"]),
        changeScore: score,
        description: "from automation",
      });
    }
    const replacedContentKeys = Object.keys(replacedContent);

    const teamMemberKeys = replacedContentKeys.filter(
      (key) => !["customers", "companies"].includes(key)
    );

    let teamMemberIds: string[] = [];

    for (const key of teamMemberKeys) {
      teamMemberIds = [
        ...teamMemberIds,
        ...(await generateIds(replacedContent[key])),
      ];
    }

    if (!teamMemberIds?.length) {
      return "done";
    }

    await models.ScoreLogs.changeOwnersScore({
      ownerType: "user",
      ownerIds: teamMemberIds || [],
      changeScore: score,
      description: "from automation",
    });

    return "done";
  }

  return { error: "Not Selected Action configuration" };
};

const addSpin = async ({
  models,
  subdomain,
  execution,
  contentType,
  config,
}: {
  models: IModels;
  subdomain: string;
  execution: any;
  contentType: string;
  config: any;
}) => {
  let { ownerId, ownerType } = await getOwner({
    models,
    subdomain,
    execution,
    contentType,
    config,
  });

  if (ownerType === "customer") {
    const customerRelatedClientPortalUser = await sendClientPortalMessage({
      subdomain,
      action: "clientPortalUsers.findOne",
      data: {
        erxesCustomerId: ownerId,
      },
      isRPC: true,
      defaultValue: null,
    });

    if (customerRelatedClientPortalUser) {
      ownerId = customerRelatedClientPortalUser._id;
      ownerType = "cpUser";
    }
  }

  return await models.Spins.createSpin({
    ownerId,
    ownerType,
    campaignId: config.spinCampaignId,
  });
};

const getLoyatyCampaignConfig = async (serviceName: string) => {
  const service = await getService(serviceName);

  const meta = service.config?.meta || {};

  if (meta && meta?.loyalties && meta?.loyalties?.aviableAttributes) {
    const {
      name,
      label,
      isAviableAdditionalConfig,
      icon,
      extendTargetAutomation,
    } = meta?.loyalties || {};
    return {
      name,
      label,
      isAviableAdditionalConfig,
      icon,
      extendTargetAutomation,
    };
  }
  return {};
};

const docScoreCampaign = async ({
  models,
  subdomain,
  contentType,
  execution,
  config,
}: {
  models: IModels;
  subdomain: string;
  contentType: string;
  execution: any;
  config: any;
}) => {
  const { ownerId, ownerType } = await getOwner({
    models,
    subdomain,
    execution,
    contentType,
    config,
  });

  let target = execution.target;

  const [serviceName] = (execution?.triggerType || "").split(":");

  const { extendTargetAutomation } =
    (await getLoyatyCampaignConfig(serviceName)) || {};

  console.log({ extendTargetAutomation, serviceName });

  if (extendTargetAutomation) {
    target = await sendCommonMessage({
      subdomain,
      serviceName,
      action: "targetExtender",
      data: { target, campaignId: config.campaignId },
      isRPC: true,
      defaultValue: target,
    });
    console.log({ target });
  }

  return await models.ScoreCampaigns.doCampaign({
    serviceName,
    targetId: execution.targetId,
    campaignId: config.campaignId,
    actionMethod: config.action,
    ownerId,
    ownerType,
    target,
  });
};

const actionCreate = async ({ subdomain, action, execution }) => {
  const models = await generateModels(subdomain);
  const { config = {}, type } = action;
  const { triggerType } = execution || {};

  const [serviceName, contentType] = triggerType.split(/[:.]/);

  try {
    switch (type) {
      case "loyalties:score.create":
        await new Promise((resolve) => setTimeout(resolve, 3000));

        return await addScore({
          models,
          subdomain,
          serviceName,
          contentType,
          execution,
          config,
        });

      case "loyalties:voucher.create":
        return createVoucher({
          models,
          subdomain,
          execution,
          contentType,
          config,
        });
      case "loyalties:spin.create":
        return addSpin({
          models,
          subdomain,
          execution,
          contentType,
          config,
        });
      default:
        return {};
    }
  } catch (e) {
    return { error: e.message };
  }
};
