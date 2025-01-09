import { generateModels, IModels } from "./connectionResolver";
import {
  sendClientPortalMessage,
  sendCommonMessage,
  sendCoreMessage
} from "./messageBroker";

export default {
  constants: {
    actions: [
      {
        type: "loyalties:voucher.create",
        icon: "file-plus",
        label: "Create voucher",
        description: "Create voucher",
        isAvailable: true
      },
      {
        type: "loyalties:score.create",
        icon: "file-plus",
        label: "Change Score",
        description: "Change Score",
        isAvailable: true
      },
      {
        type: "loyalties:spin.create",
        icon: "file-plus",
        label: "Create Spin",
        description: "Create Spin",
        isAvailable: true
      }
    ]
  },
  receiveActions: async ({
    subdomain,
    data: { action, execution, actionType }
  }) => {
    const models = await generateModels(subdomain);

    if (actionType === "create") {
      return actionCreate({ subdomain, action, execution });
    }

    return;
  }
};

const generateAttributes = value => {
  const matches = (value || "").match(/\{\{\s*([^}]+)\s*\}\}/g);
  return matches.map(match => match.replace(/\{\{\s*|\s*\}\}/g, ""));
};

const generateIds = async value => {
  if (
    Array.isArray(value) &&
    (value || []).every(value => typeof value === "string")
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
  config
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
    ["inbox:conversation", "pos:posOrder"].some(type =>
      execution.triggerType.includes(type)
    )
  ) {
    ownerType = "customer";
    ownerId = execution.target.customerId;
  }

  if (
    [
      "tasks:task",
      "sales:deal",
      "tickets:ticket",
      "purchases:purchase"
    ].includes(execution.triggerType)
  ) {
    const customerIds = await sendCoreMessage({
      subdomain,
      action: "conformities.savedConformity",
      data: {
        mainType: contentType,
        mainTypeId: execution.targetId,
        relTypes: ["customer"]
      },
      isRPC: true,
      defaultValue: []
    });

    if (customerIds.length) {
      const customers = await sendCoreMessage({
        subdomain,
        action: "customers.find",
        data: {
          _id: { $in: customerIds }
        },
        isRPC: true,
        defaultValue: []
      });

      if (customers.length) {
        ownerType = "customer";
        ownerId = customers[0]._id;
      }
    }
  }
  return { ownerType, ownerId };
};

const createVoucher = async ({
  models,
  subdomain,
  execution,
  contentType,
  config
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

  if (["inbox:conversation", "pos:posOrder"].includes(execution.triggerType)) {
    ownerType = "customer";
    ownerId = execution.target.customerId;
  }

  if (
    [
      "tasks:task",
      "sales:deal",
      "tickets:ticket",
      "purchases:purchase"
    ].includes(execution.triggerType)
  ) {
    const customerIds = await sendCoreMessage({
      subdomain,
      action: "conformities.savedConformity",
      data: {
        mainType: contentType,
        mainTypeId: execution.targetId,
        relTypes: ["customer"]
      },
      isRPC: true,
      defaultValue: []
    });

    if (customerIds.length) {
      const customers = await sendCoreMessage({
        subdomain,
        action: "customers.find",
        data: {
          _id: { $in: customerIds }
        },
        isRPC: true,
        defaultValue: []
      });

      if (customers.length) {
        ownerType = "customer";
        ownerId = customers[0]._id;
      }
    }
  }

  return await models.Vouchers.createVoucher({
    campaignId: config.voucherCampaignId,
    ownerType,
    ownerId
  });
};

const replaceContent = async ({ serviceName, subdomain, data }) => {
  const replacedContent = await sendCommonMessage({
    serviceName,
    subdomain,
    action: "automations.replacePlaceHolders",
    data,
    isRPC: true,
    defaultValue: {}
  });

  return replacedContent?.scoreString || 0;
};

const evalPlaceHolder = placeholder => {
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
  config
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
      _id: campaignId
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
          scoreString: actionConfig.placeholder
        }
      }
    });
    console.log({ placeholder });

    const score = evalPlaceHolder(placeholder);
    console.log({ score });

    return Number(score) / Number(actionConfig.currencyRatio);
  }

  if (scoreString.match(/\{\{\s*([^}]+)\s*\}\}/g)) {
    scoreString = await replaceContent({
      serviceName,
      subdomain,
      data: {
        target,
        config: {
          scoreString
        }
      }
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
  config
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
      config
    });
  }

  const score = await generateScore({
    serviceName,
    models,
    subdomain,
    target: execution.target,
    config
  });

  if (!!config?.ownerType && !!config?.ownerIds?.length) {
    return await models.ScoreLogs.changeOwnersScore({
      ownerType: config.ownerType,
      ownerIds: config.ownerIds,
      changeScore: score,
      description: "from automation"
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
        config
      });

      await models.ScoreLogs.changeOwnersScore({
        ownerType,
        ownerIds: [ownerId],
        changeScore: score,
        description: "from automation"
      });
      attributes = attributes.filter(
        attribute => attribute !== "triggerExecutor"
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
          : contentType
      },
      config: {},
      relatedValueProps: {}
    };

    for (const attribute of attributes) {
      data.config[attribute] = `{{ ${attribute} }}`;
      data.relatedValueProps[attribute] = {
        key: "_id"
      };
    }

    const replacedContent = await sendCommonMessage({
      subdomain,
      serviceName,
      action: "automations.replacePlaceHolders",
      data,
      isRPC: true,
      defaultValue: {}
    });

    if (replacedContent["customers"]) {
      await models.ScoreLogs.changeOwnersScore({
        ownerType: "customer",
        ownerIds: await generateIds(replacedContent["customers"]),
        changeScore: score,
        description: "from automation"
      });
    }

    if (replacedContent["companies"]) {
      await models.ScoreLogs.changeOwnersScore({
        ownerType: "company",
        ownerIds: await generateIds(replacedContent["companies"]),
        changeScore: score,
        description: "from automation"
      });
    }
    const replacedContentKeys = Object.keys(replacedContent);

    const teamMemberKeys = replacedContentKeys.filter(
      key => !["customers", "companies"].includes(key)
    );

    let teamMemberIds: string[] = [];

    for (const key of teamMemberKeys) {
      teamMemberIds = [
        ...teamMemberIds,
        ...(await generateIds(replacedContent[key]))
      ];
    }

    if (!teamMemberIds?.length) {
      return "done";
    }

    await models.ScoreLogs.changeOwnersScore({
      ownerType: "user",
      ownerIds: teamMemberIds || [],
      changeScore: score,
      description: "from automation"
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
  config
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
    config
  });

  if (ownerType === "customer") {
    const customerRelatedClientPortalUser = await sendClientPortalMessage({
      subdomain,
      action: "clientPortalUsers.findOne",
      data: {
        erxesCustomerId: ownerId
      },
      isRPC: true,
      defaultValue: null
    });

    if (customerRelatedClientPortalUser) {
      ownerId = customerRelatedClientPortalUser._id;
      ownerType = "cpUser";
    }
  }

  return await models.Spins.createSpin({
    ownerId,
    ownerType,
    campaignId: config.spinCampaignId
  });
};

const docScoreCampaign = async ({
  models,
  subdomain,
  contentType,
  execution,
  config
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
    config
  });

  return await models.ScoreCampaigns.doCampaign({
    serviceName: execution.triggerType,
    targetId: execution.targetId,
    campaignId: config.campaignId,
    actionMethod: config.action,
    ownerId,
    ownerType,
    target: execution.target
  });
};

const actionCreate = async ({ subdomain, action, execution }) => {
  const models = await generateModels(subdomain);
  const { config = {}, type } = action;
  const { triggerType } = execution || {};

  const [serviceName, contentType] = triggerType.split(":");
  try {
    switch (type) {
      case "loyalties:score.create":
        return await addScore({
          models,
          subdomain,
          serviceName,
          contentType,
          execution,
          config
        });

      case "loyalties:voucher.create":
        return createVoucher({
          models,
          subdomain,
          execution,
          contentType,
          config
        });
      case "loyalties:spin.create":
        return addSpin({
          models,
          subdomain,
          execution,
          contentType,
          config
        });
      default:
        return {};
    }
  } catch (e) {
    return { error: e.message };
  }
};
