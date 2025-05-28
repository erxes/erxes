import {
  checkPermission,
  requireLogin
} from "@erxes/api-utils/src/permissions";
import { IContext } from "../../../connectionResolver";
import { sendMessage } from "@erxes/api-utils/src/core";
import { putCreateLog, putDeleteLog, putUpdateLog } from "../../../logUtils";

const orderMutations = {
  bmOrderAdd: async (
    _root,
    doc,
    { user, docModifier, models, subdomain }: IContext
  ) => {
    const order = await models.Orders.createOrder(
      docModifier(doc?.order),
      user
    );
    const tour = await models.Tours.getTour(order.tourId);
    const branch = await models.BmsBranch.findById(order.branchId);

    await sendMessage({
      serviceName: "notifications",
      subdomain,
      action: "send",
      data: {
        notifType: `orderadd`,
        title: "Захиалга үүслээ",
        content: `${order.amount} дүнтэй захиалга, ${tour.name} тур дээр ирлээ.`,
        action: `Reminder:`,
        link: `${order.id}`,
        createdUser: user,
        // exclude current user
        contentType: "bm:order",
        contentTypeId: order._id,
        receivers: [...(branch?.user1Ids || []), ...(branch?.user2Ids || [])]
      }
    });
    await putCreateLog(
      subdomain,
      {
        type: "order",
        newData: doc,
        object: order
      },
      user
    );
    return order;
  },

  bmOrderEdit: async (
    _root,
    { _id, ...doc },
    { models, user, subdomain }: IContext
  ) => {
    const order = await models.Orders.getOrder(_id);

    const updated = await models.Orders.updateOrder(_id, doc?.order as any);
    await putUpdateLog(
      subdomain,
      {
        type: "order",
        object: order,
        newData: doc,
        updatedDocument: updated
      },
      user
    );
    const tour = await models.Tours.getTour(order.tourId);
    const branch = await models.BmsBranch.findById(order.branchId);

    await sendMessage({
      serviceName: "notifications",
      subdomain,
      action: "send",
      data: {
        notifType: `orderedit`,
        title: "Захиалга засах",
        content: `${order.amount} дүнтэй захиалга засагдлаа, ${tour.name} `,
        action: `Reminder:`,
        link: `${order.id}`,
        createdUser: user,
        // exclude current user
        contentType: "bm:order",
        contentTypeId: order._id,
        receivers: [...(branch?.user1Ids || []), ...(branch?.user2Ids || [])]
      }
    });
    return updated;
  },

  bmOrderRemove: async (
    _root,
    { ids }: { ids: string[] },
    { models, user, subdomain }: IContext
  ) => {
    const orders = await models.Orders.find({ _id: { $in: ids } });
    for (const order of orders) {
      await models.Orders.deleteOne({ _id: order._id });
      await putDeleteLog(subdomain, { type: "order", object: order }, user);
      const branch = await models.BmsBranch.findById(order.branchId);

      await sendMessage({
        serviceName: "notifications",
        subdomain,
        action: "send",
        data: {
          notifType: `orderremove`,
          title: "Захиалга устлаа",
          content: `${order.amount} дүнтэй захиалга устлаа`,
          action: `Reminder:`,
          link: `${order.id}`,
          createdUser: user,
          // exclude current user
          contentType: "bm:order",
          contentTypeId: order._id,
          receivers: [...(branch?.user1Ids || []), ...(branch?.user2Ids || [])]
        }
      });
    }
    return ids;
  }
};

export default orderMutations;
