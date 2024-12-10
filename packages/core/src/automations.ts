import {
  replacePlaceHolders,
  setProperty
} from "@erxes/api-utils/src/automations";
import { generateModels, IModels } from "./connectionResolver";
import { sendCommonMessage } from "./messageBroker";

const getRelatedValue = async (
  models: IModels,
  subdomain: string,
  target,
  targetKey
) => {
  if (
    [
      "userId",
      "assignedUserId",
      "closedUserId",
      "ownerId",
      "createdBy"
    ].includes(targetKey)
  ) {
    const user = await models.Users.getUser(target[targetKey]);

    return (
      (user && ((user.details && user.details.fullName) || user.email)) || ""
    );
  }

  if (
    ["participatedUserIds", "assignedUserIds", "watchedUserIds"].includes(
      targetKey
    )
  ) {
    const users = await models.Users.find({ _id: { $in: target[targetKey] } });

    return (
      users.map(
        user => (user.details && user.details.fullName) || user.email
      ) || []
    ).join(", ");
  }

  if (targetKey === "tagIds") {
    const tags = await sendCommonMessage({
      subdomain,
      serviceName: "tags",
      action: "tagFind",
      data: { _id: { $in: target[targetKey] } }
    });

    return (tags.map(tag => tag.name) || []).join(", ");
  }

  return false;
};

// find trigger related module items
const getItems = async (
  subdomain: string,
  module: string,
  execution: any,
  triggerType: string
) => {
  const { target } = execution;

  if (module === triggerType) {
    return [target];
  }

  const models = await generateModels(subdomain);

  let model: any = models.Customers;

  if (module.includes("company")) {
    model = models.Companies;
  }

  const [moduleService] = module.split(":");
  const [triggerService, triggerContentType] = triggerType.split(":");

  if (
    triggerContentType !== "form_submission" &&
    moduleService === triggerService
  ) {
    const relTypeIds = await sendCommonMessage({
      subdomain,
      serviceName: "core",
      action: "conformities.savedConformity",
      data: {
        mainType: triggerType.split(":")[1],
        mainTypeId: target._id,
        relTypes: [module.split(":")[1]]
      },
      isRPC: true
    });

    return model.find({ _id: { $in: relTypeIds } });
  }

  let filter;

  if (triggerContentType === "form_submission") {
    filter = { _id: target._id };
  } else {
    // send message to trigger service to get related value
    filter = await sendCommonMessage({
      subdomain,
      serviceName: triggerService,
      action: "getModuleRelation",
      data: {
        module,
        triggerType,
        target
      },
      isRPC: true,
      defaultValue: null
    });
  }

  return filter ? model.find(filter) : [];
};

export default {
  receiveActions: async ({
    subdomain,
    data: { action, execution, triggerType, actionType }
  }) => {
    const models = await generateModels(subdomain);

    if (actionType === "set-property") {
      const { module, rules } = action.config;

      const relatedItems = await getItems(
        subdomain,
        module,
        execution,
        triggerType
      );

      return setProperty({
        models,
        subdomain,
        getRelatedValue,
        module: module.includes("lead") ? "core:customer" : module,
        rules,
        execution,
        sendCommonMessage,
        relatedItems,
        triggerType
      });
    }
  },
  replacePlaceHolders: async ({
    subdomain,
    data: { target, config, relatedValueProps }
  }) => {
    const models = generateModels(subdomain);

    return await replacePlaceHolders({
      models,
      subdomain,
      getRelatedValue,
      actionData: config,
      target,
      relatedValueProps
    });
  },
  getRecipientsEmails: async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);
    const { type, config } = data;

    const ids = config[`${type}Ids`];

    const commonFilter = {
      _id: { $in: Array.isArray(ids) ? ids : [ids] }
    };

    if (type === "user") {
      const result = await models.Users.find(commonFilter).distinct("email");

      return result;
    }

    const CONTACT_TYPES = {
      lead: {
        model: models.Customers,
        filter: { ...commonFilter }
      },
      customer: {
        model: models.Customers,
        filter: {
          ...commonFilter
        }
      },
      company: {
        model: models.Companies,
        filter: { ...commonFilter }
      }
    };

    const { model, filter } = CONTACT_TYPES[type];

    return await model.find(filter).distinct("primaryEmail");
  },
  constants: {
    triggers: [
      {
        type: "core:user",
        img: "automation4.svg",
        icon: "users",
        label: "Team member",
        description:
          "Start with a blank workflow that enralls and is triggered off team members"
      },
      {
        type: "core:customer",
        img: "automation2.svg",
        icon: "users-alt",
        label: "Customer",
        description:
          "Start with a blank workflow that enrolls and is triggered off Customers"
      },
      {
        type: "core:lead",
        img: "automation2.svg",
        icon: "users-alt",
        label: "Lead",
        description:
          "Start with a blank workflow that enrolls and is triggered off Leads"
      },
      {
        type: "core:company",
        img: "automation2.svg",
        icon: "university",
        label: "Company",
        description:
          "Start with a blank workflow that enrolls and is triggered off company"
      },
      {
        type: "core:form_submission",
        img: "automation2.svg",
        icon: "university",
        label: "Form submission",
        description:
          "Start with a blank workflow that enrolls and is triggered off form submission"
      }
    ]
  }
};
