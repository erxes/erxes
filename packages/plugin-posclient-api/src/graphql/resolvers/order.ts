import { IContext } from "../../connectionResolver";
import { IOrderDocument } from "../../models/definitions/orders";
import { IOrderItemDocument } from "../../models/definitions/orderItems";
import { IEbarimtDocument } from "../../models/definitions/putResponses";
import {
  sendSalesMessage,
  sendCoreMessage
} from "../../messageBroker";
import { fakePutData } from "../utils/orderUtils";

export default {
  async items(order: IOrderDocument, {}, { models }: IContext) {
    return await models.OrderItems.find({ orderId: order._id }).lean();
  },

  async customer(order: IOrderDocument, _params, { subdomain }: IContext) {
    if (!order.customerId) {
      return null;
    }

    if (order.customerType === "visitor") {
      return null;
    }

    if (order.customerType === "company") {
      const company = await sendCoreMessage({
        subdomain,
        action: "companies.findOne",
        data: { _id: order.customerId },
        isRPC: true,
        defaultValue: {}
      });

      if (!company?._id) {
        return null;
      }

      return {
        _id: company._id,
        code: company.code,
        primaryPhone: company.primaryPhone,
        primaryEmail: company.primaryEmail,
        firstName: company.primaryName,
        lastName: ""
      };
    }

    if (order.customerType === "user") {
      const user = await sendCoreMessage({
        subdomain,
        action: "users.findOne",
        data: { _id: order.customerId },
        isRPC: true,
        defaultValue: {}
      });

      if (!user?._id) {
        return null;
      }

      return {
        _id: user._id,
        code: user.code,
        primaryPhone: (user.details && user.details.operatorPhone) || "",
        primaryEmail: user.email,
        firstName: `${user.firstName || ""} ${user.lastName || ""}`,
        lastName: user.username
      };
    }

    const customer = await sendCoreMessage({
      subdomain,
      action: "customers.findOne",
      data: { _id: order.customerId },
      isRPC: true,
      defaultValue: {}
    });

    if (!customer?._id) {
      return null;
    }

    return {
      _id: customer._id,
      code: customer.code,
      primaryPhone: customer.primaryPhone,
      primaryEmail: customer.primaryEmail,
      firstName: customer.firstName,
      lastName: customer.lastName
    };
  },

  async user(order: IOrderDocument, {}, { models }: IContext) {
    return models.PosUsers.findOne({ _id: order.userId });
  },

  async putResponses(order: IOrderDocument, {}, { models, config }: IContext) {
    if (order.billType === "9") {
      const items: IOrderItemDocument[] = await models.OrderItems.find({
        orderId: order._id
      }).lean();

      return [await fakePutData(models, items, order, config)];
    }

    const putResponses: IEbarimtDocument[] = await models.PutResponses.find({
      contentType: "pos",
      contentId: order._id,
      status: { $ne: "inactive" }
    })
      .sort({ createdAt: -1 })
      .lean();

    const excludeIds: string[] = [];
    for (const falsePR of putResponses.filter(pr => pr.status !== "SUCCESS")) {
      for (const truePR of putResponses.filter(pr => pr.status === "SUCCESS")) {
        if (
          falsePR.sendInfo &&
          truePR.sendInfo &&
          falsePR.sendInfo.totalAmount === truePR.sendInfo.totalAmount &&
          falsePR.sendInfo.totalVAT === truePR.sendInfo.totalVAT &&
          falsePR.sendInfo.type === truePR.sendInfo.type &&
          falsePR.sendInfo.receipts?.length === truePR.sendInfo.receipts?.length
        ) {
          excludeIds.push(falsePR._id);
        }
      }
    }

    const innerItems = await models.OrderItems.find({
      orderId: order._id,
      isInner: true
    }).lean();

    if (innerItems && innerItems.length) {
      const response = await fakePutData(models, innerItems, order, config);
      putResponses.push(response as any);
    }

    return putResponses.filter(pr => !excludeIds.includes(pr._id));
  },

  async deal(order: IOrderDocument, {}, { subdomain }: IContext) {
    if (!order.convertDealId) {
      return null;
    }

    return await sendSalesMessage({
      subdomain,
      action: "deals.findOne",
      data: { _id: order.convertDealId }
    });
  },

  async dealLink(order: IOrderDocument, {}, { subdomain }: IContext) {
    if (!order.convertDealId) {
      return null;
    }
    return await sendSalesMessage({
      subdomain,
      action: "getLink",
      data: { _id: order.convertDealId, type: "deal" },
      isRPC: true
    });
  }
};
