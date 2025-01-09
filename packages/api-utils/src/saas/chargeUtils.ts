import { debugError } from "@erxes/api-utils/src/debuggers";
import { sendRPCMessage } from "../messageBroker";
import { ORGANIZATION_PLAN } from "./constants";
import {
  coreModelOrganizations,
  // getOrgPromoCodes,
  getOrganizationDetail,
  getPlugins,
  removeOrgsCache
} from "./saas";
import { IOrganization } from "./types";

const sendCommonMessage = async ({ serviceName, action, subdomain, data }) => {
  return sendRPCMessage(serviceName + ":" + action, {
    subdomain,
    data
  });
};

export const getUsageByPluginType = async (args: {
  subdomain: string;
  pluginType?: string;
  methodName?: string;
  actionName?: string;
  models?;
  params?;
}) => {
  const { subdomain, methodName, actionName, models, params } = args;
  let pluginType = args.pluginType;

  let totalUsage = 0;

  if (methodName === "integrationsCreateLeadIntegration") {
    pluginType = "inbox:popups";
  }

  if (methodName === "integrationsCreateLeadIntegration") {
    pluginType = "inbox:popups";
  }

  if (methodName === "integrationsCreateExternalIntegration") {
    const integrationKind = params ? params.kind : "";

    switch (integrationKind) {
      case "facebook-post":
        pluginType = "facebookPost";

      case "facebook-messenger":
        pluginType = "facebookMessenger";

      case "instagram-post":
        pluginType = "instagramPost";

      case "instagram-messenger":
        pluginType = "instagramMessenger";

      case "whatsapp":
          pluginType = "whatsapp";
    }
  }

  if (methodName === "customersAdd") {
    pluginType = "contacts";
  }

  if (methodName === "integrationsCreateLeadIntegration") {
    pluginType = "inbox:popups";
  }

  if (methodName === "integrationsCreateMessengerIntegration") {
    pluginType = "inbox:messenger";
  }

  if (methodName === "knowledgeBaseTopicsAdd") {
    pluginType = "knowledgebase";
  }

  if (methodName === "automationsAdd") {
    pluginType = "automations";
  }

  if (methodName === "segmentsAdd") {
    pluginType = "segments";
  }

  if (methodName === "usersInvite") {
    pluginType = "teamMembers";
  }

  if (methodName === "boardsAdd") {
    if (actionName === "dealBoardsAdd") {
      pluginType = "sales:deals";
    }

    if (actionName === "taskBoardsAdd") {
      pluginType = "tasks:tasks";
    }

    if (actionName === "ticketBoardsAdd") {
      pluginType = "tickets:ticket";
    }

    if (actionName === "growthHackBoardsAdd") {
      pluginType = "growthhacks:growthHacks";
    }
  }

  if (methodName === "clientPortalConfigUpdate") {
    pluginType = "clientportal";
  }

  if (pluginType === "contacts") {
    if (models) {
      totalUsage = await models.Customers.find({}).countDocuments();
    } else {
      totalUsage = await sendCommonMessage({
        subdomain,
        serviceName: "core",
        action: "customers.count",
        data: {}
      });
    }
  }

  if (pluginType === "facebookPost") {
    const selector = { kind: "facebook-post" };

    if (models) {
      totalUsage = await models.Integrations.find(selector).countDocuments();
    } else {
      totalUsage = await sendCommonMessage({
        subdomain,
        serviceName: "inbox",
        action: "integrations.count",
        data: { selector }
      });
    }
  }
  if (pluginType === "instagramPost") {
    const selector = { kind: "instagram-post" };

    if (models) {
      totalUsage = await models.Integrations.find(selector).countDocuments();
    } else {
      totalUsage = await sendCommonMessage({
        subdomain,
        serviceName: "inbox",
        action: "integrations.count",
        data: { selector }
      });
    }
  }
  if (pluginType === "facebookMessenger") {
    const selector = { kind: "facebook-messenger" };

    if (models) {
      totalUsage = await models.Integrations.find(selector).countDocuments();
    } else {
      totalUsage = await sendCommonMessage({
        subdomain,
        serviceName: "inbox",
        action: "integrations.count",
        data: { selector }
      });
    }
  }

  if (pluginType === "whatsapp") {
    const selector = { kind: "whatsapp" };

    if (models) {
      totalUsage = await models.Integrations.find(selector).countDocuments();
    } else {
      totalUsage = await sendCommonMessage({
        subdomain,
        serviceName: "inbox",
        action: "integrations.count",
        data: { selector }
      });
    }
  }
  if (pluginType === "instagramMessenger") {
    const selector = { kind: "instagram-messenger" };

    if (models) {
      totalUsage = await models.Integrations.find(selector).countDocuments();
    } else {
      totalUsage = await sendCommonMessage({
        subdomain,
        serviceName: "inbox",
        action: "integrations.count",
        data: { selector }
      });
    }
  }
  if (pluginType === "tickets:tickets") {
    if (models) {
      totalUsage = await models.Boards.find({
        type: "ticket"
      }).countDocuments();
    } else {
      totalUsage = await sendCommonMessage({
        subdomain,
        serviceName: "cards",
        action: "boards.count",
        data: { selector: { type: "ticket" } }
      });
    }
  }

  if (pluginType === "tasks:tasks") {
    if (models) {
      totalUsage = await models.Boards.find({ type: "task" }).countDocuments();
    } else {
      totalUsage = await sendCommonMessage({
        subdomain,
        serviceName: "cards",
        action: "boards.count",
        data: { selector: { type: "task" } }
      });
    }
  }

  if (pluginType === "sales:deals") {
    if (models) {
      totalUsage = await models.Boards.find({ type: "deal" }).countDocuments();
    } else {
      totalUsage = await sendCommonMessage({
        subdomain,
        serviceName: "cards",
        action: "boards.count",
        data: { selector: { type: "deal" } }
      });
    }
  }

  if (pluginType === "growthhacks:growthHacks") {
    if (models) {
      totalUsage = await models.GrowthHacks.find({}).countDocuments();
    } else {
      totalUsage = await sendCommonMessage({
        subdomain,
        serviceName: "cards",
        action: "boards.count",
        data: { selector: { type: "growthHack" } }
      });
    }
  }

  if (pluginType === "inbox:messenger") {
    const selector = { kind: "messenger" };

    if (models) {
      totalUsage = await models.Integrations.find(selector).countDocuments();
    } else {
      totalUsage = await sendCommonMessage({
        subdomain,
        serviceName: "inbox",
        action: "integrations.count",
        data: { selector }
      });
    }
  }

  if (pluginType === "inbox:popups") {
    const selector = { kind: "lead" };

    if (models) {
      totalUsage = await models.Integrations.find(selector).countDocuments();
    } else {
      totalUsage = await sendCommonMessage({
        subdomain,
        serviceName: "inbox",
        action: "integrations.count",
        data: { selector }
      });
    }
  }

  if (pluginType === "knowledgebase") {
    if (models) {
      totalUsage = await models.KnowledgeBaseCategories.find(
        {}
      ).countDocuments();
    } else {
      totalUsage = await sendCommonMessage({
        subdomain,
        serviceName: "knowledgebase",
        action: "topics.count",
        data: {}
      });
    }
  }

  if (pluginType === "clientPortal") {
    if (models) {
      totalUsage = await models.ClientPortals.find({}).countDocuments();
    } else {
      totalUsage = await sendCommonMessage({
        subdomain,
        serviceName: "clientportal",
        action: "clientPortals.count",
        data: {}
      });
    }
  }

  if (pluginType === "automations") {
    if (models) {
      totalUsage = await models.Automations.find({}).countDocuments();
    } else {
      totalUsage = await sendCommonMessage({
        subdomain,
        serviceName: "automations",
        action: "find.count",
        data: {}
      });
    }
  }

  if (pluginType === "segments") {
    if (models) {
      totalUsage = await models.Segments.find({
        name: { $exists: true },
      }).countDocuments();
    } else {
      totalUsage = await sendCommonMessage({
        subdomain,
        serviceName: 'core',
        action: 'segmentCount',
        data: { selector:{name: { $exists: true }} },
      });
    }
  }

  if (pluginType === "teamMembers") {
    if (models) {
      totalUsage = await models.Users.find({}).countDocuments();
    } else {
      totalUsage = await sendCommonMessage({
        subdomain,
        serviceName: "core",
        action: "users.getCount",
        data: {}
      });
    }
  }

  return { totalUsage, pluginType };
};

export const checkOrganizationCharge = async (args: {
  plType?: string;
  methodName?: string;
  actionName?: string;
  aboutToAddAmout?: number;
  donotCalcUsed?: boolean;
  context;
  params?;
}) => {
  const {
    context,
    plType,
    donotCalcUsed,
    methodName,
    actionName,
    aboutToAddAmout,
    params
  } = args;
  const { models, subdomain } = context;

  let organization;

  organization = await getOrganizationDetail({ subdomain, models });

  const { pluginType } = await getUsageByPluginType({
    subdomain,
    pluginType: plType,
    methodName,
    actionName,
    models,
    params
  });

  if (!pluginType) {
    return;
  }

  // const orgPromoCodes = await getOrgPromoCodes(organization);

  const { totalAmount, usedAmount } = await calcUsage({
    subdomain,
    pluginType,
    organization,
    donotCalcUsed,
    // orgPromoCodes,
    params
  });

  if (usedAmount + (aboutToAddAmout || 0) >= totalAmount) {
    throw new Error("Your limit is reached. Please, purchase more Add Ons.");
  }
};

export const calcUsage = async (args: {
  subdomain: string;
  pluginType: string;
  organization: IOrganization;
  donotCalcUsed?: boolean;
  // orgPromoCodes: any[];
  params?: any;
}): Promise<any> => {
  const {
    subdomain,
    donotCalcUsed,
    pluginType,
    organization,
    // orgPromoCodes,
    params
  } = args;

  const plugins = await getPlugins({});
  const charge = organization.charge || {};
  const plan = organization.plan || "";

  const plugin = plugins.find(p => p.type === pluginType);

  if (!plugin) {
    return {
      initialCount: 0,
      freeAmount: 0,
      purchasedAmount: 0,
      totalAmount: 0,
      usedAmount: 0,
      remainingAmount: 0
    };
  }

  const { count = 0, growthInitialCount = 0, type } = plugin;

  const chargeDetail = charge[type] || {};

  const free = parseInt(chargeDetail.free || 0, 10);

  let totalUsage;

  if (donotCalcUsed) {
    totalUsage = parseInt(chargeDetail.used || 0, 10);
  } else {
    try {
      const usageResponse = await getUsageByPluginType({
        pluginType,
        subdomain,
        params
      });
      totalUsage = usageResponse.totalUsage || 0;
    } catch (error) {
      debugError(`Error occurred while getting plugin usage ${error.message}`);
    }
  }

  const purchased = parseInt(chargeDetail.purchased || 0, 10);

  const freeAmount = free;
  const purchasedAmount = count ? purchased * count : purchased;

  let totalAmount = freeAmount + purchasedAmount;
  let promoCodeAmount = 0;

  // if (orgPromoCodes.length) {
  //   // find promo code amount that related current plugin
  //   for (const promoCode of orgPromoCodes) {
  //     const { amounts = {} } = promoCode;

  //     const pluginAmount = amounts[plugin.type] || 0;

  //     if (pluginAmount) {
  //       promoCodeAmount += pluginAmount;
  //     }
  //   }

  //   totalAmount += promoCodeAmount;
  // } else
  if (plan === ORGANIZATION_PLAN.GROWTH) {
    totalAmount += growthInitialCount;
  }

  const remainingAmount = totalAmount - totalUsage || 0;

  return {
    freeAmount,
    purchasedAmount,
    promoCodeAmount: isNaN(promoCodeAmount) ? 0 : promoCodeAmount,
    totalAmount,
    usedAmount: totalUsage,
    remainingAmount
  };
};

export const updateUsageCharge = async (args: {
  models: any;
  subdomain: string;
  plType: string;
  amount: number;
}) => {
  const { models, subdomain, plType, amount } = args;

  const organization = await getOrganizationDetail({ subdomain, models });

  const orgCharge = organization.charge || {};
  const charge = orgCharge[plType] || {};
  const totalUsage = charge.used || 0;

  await coreModelOrganizations.updateOne(
    { _id: organization._id },
    { $set: { [`charge.${plType}.used`]: totalUsage + amount } },
    { upsert: true }
  );

  await removeOrgsCache("updateOrganization");

  return getOrganizationDetail({ subdomain, models });
};
