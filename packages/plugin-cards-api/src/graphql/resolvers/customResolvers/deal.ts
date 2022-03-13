import { IDealDocument } from "../../../models/definitions/deals";
import { boardId } from "../../utils";
import { IContext } from "../../../connectionResolver";
import {
  sendContactsMessage,
  sendCoreMessage,
  sendFormsMessage,
  sendNotificationsMessage,
  sendProductsMessage,
} from "../../../messageBroker";

export const generateProducts = async (subdomain: string, productsData) => {
  const products: any = [];

  for (const data of productsData || []) {
    if (!data.productId) {
      continue;
    }

    const product = await sendProductsMessage({
      subdomain,
      action: "findOne",
      data: { _id: data.productId },
      isRPC: true,
    });

    const { customFieldsData } = product;

    const customFields: any[] = [];

    for (const customFieldData of customFieldsData || []) {
      const field = await sendFormsMessage({
        subdomain,
        action: "fields:findOne",
        data: { _id: customFieldData.field },
        isRPC: true,
      });

      if (field) {
        customFields[customFieldData.field] = {
          text: field.text,
          data: customFieldData.value,
        };
      }
    }

    product.customFieldsData = customFields;

    products.push({
      ...(typeof data.toJSON === "function" ? data.toJSON() : data),
      product,
    });
  }

  return products;
};

export const generateAmounts = (productsData) => {
  const amountsMap = {};

  (productsData || []).forEach((product) => {
    // Tick paid or used is false then exclude
    if (!product.tickUsed) {
      return;
    }

    const type = product.currency;

    if (type) {
      if (!amountsMap[type]) {
        amountsMap[type] = 0;
      }

      amountsMap[type] += product.amount || 0;
    }
  });

  return amountsMap;
};

export default {
  async companies(deal: IDealDocument, _args, { subdomain }: IContext) {
    const companyIds = await sendCoreMessage({
      subdomain,
      action: "conformities.savedConformity",
      data: {
        mainType: "deal",
        mainTypeId: deal._id,
        relTypes: ["company"],
      },
      isRPC: true,
    });

    const activeCompanies = await sendContactsMessage({
      subdomain,
      action: "companies.findActiveCompanies",
      data: { _id: { $in: companyIds } },
      isRPC: true,
      defaultValue: [],
    });

    return (activeCompanies || []).map((c) => ({
      __typename: "Company",
      _id: c._id,
    }));
  },

  async customers(deal: IDealDocument, _args, { subdomain }: IContext) {
    const customerIds = await sendCoreMessage({
      subdomain,
      action: "conformities.savedConformity",
      data: {
        mainType: "deal",
        mainTypeId: deal._id,
        relTypes: ["customer"],
      },
      isRPC: true,
      defaultValue: [],
    });

    const activeCustomers = await sendContactsMessage({
      subdomain,
      action: "customers.findActiveCustomers",
      data: { _id: { $in: customerIds } },
      isRPC: true,
      defaultValue: [],
    });

    return (activeCustomers || []).map((c) => ({
      __typename: "Customer",
      _id: c._id,
    }));
  },

  async products(deal: IDealDocument, _args, { subdomain }: IContext) {
    return generateProducts(subdomain, deal.productsData);
  },

  amount(deal: IDealDocument) {
    return generateAmounts(deal.productsData || []);
  },

  assignedUsers(deal: IDealDocument) {
    return (deal.assignedUserIds || []).map((_id) => ({
      __typename: "User",
      _id,
    }));
  },

  async pipeline(deal: IDealDocument, _args, { models }: IContext) {
    const stage = await models.Stages.getStage(deal.stageId);

    return models.Pipelines.findOne({ _id: stage.pipelineId }).lean();
  },

  boardId(deal: IDealDocument, _args, { models }: IContext) {
    return boardId(models, deal);
  },

  stage(deal: IDealDocument, _args, { models }: IContext) {
    return models.Stages.getStage(deal.stageId);
  },

  isWatched(deal: IDealDocument, _args, { user }: IContext) {
    const watchedUserIds = deal.watchedUserIds || [];

    if (watchedUserIds && watchedUserIds.includes(user._id)) {
      return true;
    }

    return false;
  },

  hasNotified(deal: IDealDocument, _args, { user, subdomain }: IContext) {
    return sendNotificationsMessage({
      subdomain,
      action: "checkIfRead",
      data: {
        userId: user._id,
        itemId: deal._id,
      },
      isRPC: true,
      defaultValue: true,
    });
  },

  labels(deal: IDealDocument, _args, { models }: IContext) {
    return models.PipelineLabels.find({
      _id: { $in: deal.labelIds || [] },
    }).lean();
  },

  createdUser(deal: IDealDocument) {
    return { __typename: "User", _id: deal.userId };
  },
};
